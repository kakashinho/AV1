import { Etapa } from "../modelo/etapa"
import { Funcionario } from "../modelo/funcionario"
import { StatusEtapa } from "../enums"
import { perguntar } from "../input"
import { salvarDados, carregarDados } from "../persistencia"
import { Aeronave } from "../modelo/aeronave"

class EtapaManager {
  private etapas: Etapa[] = []
  private funcionarios: Funcionario[] = []
  private caminhoEtapas = "./src/dados/etapas.txt"
  private caminhoFuncionarios = "./src/dados/funcionarios.txt"

  load() {
    const dadosEtapas = carregarDados(this.caminhoEtapas)
    if (dadosEtapas) {
      this.etapas = dadosEtapas.map((e: any) => {
        const etapa = new Etapa(e.nome, new Date(e.prazo), e.status)
        etapa.funcionarios = e.funcionarios ?? []
        return etapa
      })
    }

    const dadosFunc = carregarDados(this.caminhoFuncionarios)
    if (dadosFunc) {
      this.funcionarios = dadosFunc.map((f: any) => new Funcionario(
        f.id, f.nome, f.telefone, f.endereco, f.usuario, f.senha, f.nivelPermissao
      ))
    }
  }

  save() { salvarDados(this.caminhoEtapas, this.etapas) }

  all() { return this.etapas.slice() }
  allFuncionarios() { return this.funcionarios.slice() }

  add(etapa: Etapa) { this.etapas.push(etapa) }
}

const etapaManager = new EtapaManager()

async function cadastrarEtapa() {
  console.log("=== Cadastrar Etapa ===")
  const nome = (await perguntar("Nome da etapa: ")).trim()
  const prazoStr = (await perguntar("Prazo (YYYY-MM-DD): ")).trim()
  const prazo = new Date(prazoStr)
  if (isNaN(prazo.getTime())) { console.log("Data inválida."); return }
  const etapa = new Etapa(nome, prazo)
  etapaManager.add(etapa)
  console.log("Etapa cadastrada com sucesso!")
}

function listarEtapas() {
  const etapas = etapaManager.all()
  if (etapas.length === 0) { console.log("Nenhuma etapa cadastrada."); return }
  etapas.forEach((etapa, i) => {
    console.log(`${i + 1} - ${etapa.nome} | Prazo: ${etapa.prazo.toDateString()} | Status: ${etapa.status}`)
  })
}

async function iniciarEtapa() {
  listarEtapas()
  const idx = parseInt((await perguntar("Número da etapa para iniciar: ")).trim(), 10) - 1
  const etapa = etapaManager.all()[idx]
  if (!etapa) return console.log("Índice inválido.")
  etapa.iniciar()
  console.log(`Etapa "${etapa.nome}" iniciada.`)
}

async function finalizarEtapa() {
  listarEtapas()
  const idx = parseInt((await perguntar("Número da etapa para finalizar: ")).trim(), 10) - 1
  const etapa = etapaManager.all()[idx]
  if (!etapa) return console.log("Etapa inválida.")
  etapa.finalizar()
  console.log(`Etapa "${etapa.nome}" finalizada.`)
}

function listarFuncionariosDisponiveis() {
  const funcionarios = etapaManager.allFuncionarios()
  if (funcionarios.length === 0) console.log("Nenhum funcionário disponível.")
  else funcionarios.forEach((f, i) => console.log(`${i + 1} - ${f.nome} (ID: ${f.id})`))
}

async function associarFuncionarioEtapa() {
  listarEtapas()
  const idxEtapa = parseInt((await perguntar("Número da etapa: ")).trim(), 10) - 1
  const etapa = etapaManager.all()[idxEtapa]
  if (!etapa) return console.log("Etapa inválida.")

  listarFuncionariosDisponiveis()
  const idxFunc = parseInt((await perguntar("Número do funcionário para associar: ")).trim(), 10) - 1
  const funcionario = etapaManager.allFuncionarios()[idxFunc]
  if (!funcionario) return console.log("Funcionário inválido.")

  etapa.associarFuncionario(funcionario)
  salvarDados("./src/dados/etapas.txt", etapaManager.all())
  console.log(`Funcionário ${funcionario.nome} associado à etapa "${etapa.nome}".`)
}

async function listarFuncionariosDaEtapa() {
  listarEtapas()
  const idxEtapa = parseInt((await perguntar("Número da etapa: ")).trim(), 10) - 1
  const etapa = etapaManager.all()[idxEtapa]
  if (!etapa) return console.log("Etapa inválida.")
  const nomes = etapa.listarFuncionarios()
  if (nomes.length === 0) console.log("Nenhum funcionário associado.")
  else { console.log("Funcionários associados:"); nomes.forEach(nome => console.log(`- ${nome}`)) }
}

async function editarEtapasDaAeronave(aeronave: Aeronave, todasAeronaves: Aeronave[]) {
  etapaManager.load()
  while (true) {
    console.log(`\n=== Editar Etapas da Aeronave ${aeronave.codigo} ===`)
    if ((aeronave.etapas ?? []).length === 0) {
      console.log("Nenhuma etapa associada.")
    } else {
      aeronave.etapas.forEach((etapa, i) => {
        console.log(`${i + 1} - ${etapa.nome} | Prazo: ${new Date(etapa.prazo).toLocaleDateString()} | Status: ${etapa.status}`)
      })
    }

    console.log("\nOpções:")
    console.log("[1] - Adicionar etapa")
    console.log("[2] - Remover etapa")
    console.log("[3] - Salvar alterações")
    console.log("[4] - Atualizar status da etapa")
    console.log("[0] - Voltar")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()

    if (opcao === "0") break

    if (opcao === "1") {
      console.log("\nEtapas disponíveis para adicionar:")
      etapaManager.all().forEach((etapa, i) =>
        console.log(`${i + 1} - ${etapa.nome} | Prazo: ${new Date(etapa.prazo).toLocaleDateString()} | Status: ${etapa.status}`)
      )
      const idx = parseInt((await perguntar("Número da etapa para adicionar: ")).trim(), 10) - 1
      const etapaSelecionada = etapaManager.all()[idx]
      if (!etapaSelecionada) { console.log("Índice inválido."); continue }

      const jaExiste = (aeronave.etapas ?? []).some(e =>
        e.nome === etapaSelecionada.nome &&
        new Date(e.prazo).toString() === new Date(etapaSelecionada.prazo).toString()
      )
      if (jaExiste) { console.log("Etapa já associada à aeronave."); continue }

      aeronave.etapas = aeronave.etapas ?? []
      aeronave.etapas.push(etapaSelecionada)
      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log(`Etapa "${etapaSelecionada.nome}" associada à aeronave.`)
    }

    else if (opcao === "2") {
      if ((aeronave.etapas ?? []).length === 0) {
        console.log("Nenhuma etapa para remover.")
        continue
      }
      const idx = parseInt((await perguntar("Número da etapa para remover: ")).trim(), 10) - 1
      if (isNaN(idx) || idx < 0 || idx >= aeronave.etapas!.length) {
        console.log("Índice inválido.")
        continue
      }
      const removida = aeronave.etapas!.splice(idx, 1)
      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log(`Etapa "${removida[0]!.nome}" removida da aeronave.`)
    }

    else if (opcao === "3") {
      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log("Alterações salvas com sucesso.")
    }

    else if (opcao === "4") {
      if (!aeronave.etapas || aeronave.etapas.length === 0) {
        console.log("Nenhuma etapa para atualizar o status.")
        continue
      }

      aeronave.etapas.forEach((etapa, i) =>
        console.log(`${i + 1} - ${etapa.nome} | Status atual: ${etapa.status}`)
      )
      
      const idx = parseInt((await perguntar("Número da etapa para atualizar o status: ")).trim(), 10) - 1
      if (isNaN(idx) || idx < 0 || idx >= aeronave.etapas.length) {
        console.log("Índice inválido.")
        continue
      }

      const statusValores = Object.values(StatusEtapa)
      console.log("Status disponíveis:")
      statusValores.forEach((status, i) => {
        console.log(`${i + 1} - ${status}`)
      })

      const statusIdx = parseInt((await perguntar("Escolha o novo status: ")).trim(), 10) - 1
      if (isNaN(statusIdx) || statusIdx < 0 || statusIdx >= statusValores.length) {
        console.log("Status inválido.")
        continue
      }

      const etapaSelecionada = aeronave.etapas[idx]!
      const novoStatus = statusValores[statusIdx]!

      if (novoStatus === StatusEtapa.ANDAMENTO || novoStatus === StatusEtapa.CONCLUIDA) {
        const indiceAnterior = idx - 1
        if (indiceAnterior >= 0) {
          const etapaAnterior = aeronave.etapas[indiceAnterior]!
          if (etapaAnterior.status !== StatusEtapa.CONCLUIDA) {
            console.log(`\nERRO: Para prosseguir com a etapa "${etapaSelecionada.nome}", a etapa anterior ("${etapaAnterior.nome}") deve estar CONCLUÍDA.`)
            continue
          }
        }
      }

      etapaSelecionada.status = novoStatus

      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log(`Status da etapa "${etapaSelecionada.nome}" atualizado para "${novoStatus}".`)
    }

    else {
      console.log("Opção inválida.")
    }
  }
}


async function menuEtapas() {
  etapaManager.load()
  console.log("Etapas carregadas (se houver).\n")
  while (true) {
    console.log("\n=== Menu Etapas ===")
    console.log("[1] - Cadastrar Etapa")
    console.log("[2] - Listar Etapas")
    console.log("[3] - Iniciar Etapa")
    console.log("[4] - Finalizar Etapa")
    console.log("[5] - Associar Funcionário")
    console.log("[6] - Listar Funcionários da Etapa")
    console.log("[7] - Salvar Etapas")
    console.log("[0] - Voltar")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()
    switch (opcao) {
      case "1": await cadastrarEtapa(); break
      case "2": listarEtapas(); break
      case "3": await iniciarEtapa(); break
      case "4": await finalizarEtapa(); break
      case "5": await associarFuncionarioEtapa(); break
      case "6": await listarFuncionariosDaEtapa(); break
      case "7": salvarDados("./src/dados/etapas.txt", etapaManager.all()); console.log("Etapas salvas."); break
      case "0": return
      default: console.log("Opção inválida.")
    }
  }
}

export { menuEtapas, editarEtapasDaAeronave }