import { Teste } from "../modelo/teste"
import { TipoTeste, ResultadoTeste } from "../enums"
import { perguntar } from "../input"
import { salvarDados, carregarDados } from "../persistencia"
import { Aeronave } from "../modelo/aeronave"

class TesteManager {
  private testes: Teste[] = []
  private caminho = "./src/dados/testes.txt"

  load() {
    const dados = carregarDados(this.caminho)
    if (!dados) return
    this.testes = dados.map((t: any) => {
      const teste = new Teste(t.tipo)
      if (t.resultado) teste.registrarResultado(t.resultado)
      return teste
    })
  }

  save() { salvarDados(this.caminho, this.testes) }
  all() { return this.testes.slice() }
  add(t: Teste) { this.testes.push(t) }
}

const testeManager = new TesteManager()

async function cadastrarTeste() {
  console.log(" === Cadastrar Teste ===")
  const tipos = Object.values(TipoTeste)
  console.log("Tipos disponíveis:")
  tipos.forEach((tipo, i) => console.log(`${i + 1} - ${tipo}`))

  const tipoStr = (await perguntar("Escolha o tipo de teste: ")).trim()
  const idx = parseInt(tipoStr, 10) - 1
  if (isNaN(idx) || idx < 0 || idx >= tipos.length) { console.log("Tipo inválido."); return }

  const tipoSelecionado = tipos[idx]!
  const teste = new Teste(tipoSelecionado)
  testeManager.add(teste)
  console.log(`Teste do tipo "${tipoSelecionado}" cadastrado com sucesso!`)
}

function listarTestes() {
  console.log(" === Lista de Testes ===")
  const lista = testeManager.all()
  if (lista.length === 0) { console.log("Nenhum teste cadastrado."); return }
  lista.forEach((teste, i) => {
    console.log(`${i + 1} - Tipo: ${teste.tipo} | Resultado: ${teste.resultado ?? "NÃO REALIZADO"}`)
  })
}

async function registrarResultadoTeste() {
  listarTestes()
  const idxStr = (await perguntar("Número do teste para registrar resultado: ")).trim()
  const idx = parseInt(idxStr, 10) - 1
  const lista = testeManager.all()
  if (isNaN(idx) || idx < 0 || idx >= lista.length) { console.log("Índice inválido."); return }

  console.log(" Resultados disponíveis:")
  const resultados = Object.values(ResultadoTeste)
  resultados.forEach((res, i) => console.log(`${i + 1} - ${res}`))

  const resStr = (await perguntar("Escolha o resultado: ")).trim()
  const idxRes = parseInt(resStr, 10) - 1
  if (isNaN(idxRes) || idxRes < 0 || idxRes >= resultados.length) { console.log("Resultado inválido."); return }

  const resultadoSelecionado = resultados[idxRes]!
  lista[idx]!.registrarResultado(resultadoSelecionado)
  console.log(`Resultado "${resultadoSelecionado}" registrado com sucesso no teste.`)
}

async function editarTestesDaAeronave(aeronave: Aeronave, todasAeronaves: Aeronave[]) {
  testeManager.load()
  while (true) {
    console.log(`
=== Editar Testes da Aeronave ${aeronave.codigo} ===`)
    if ((aeronave.testes ?? []).length === 0) console.log("Nenhum teste associado.")
    else aeronave.testes.forEach((teste, i) => console.log(`${i + 1} - Tipo: ${teste.tipo} | Resultado: ${teste.resultado ?? "NÃO REALIZADO"}`))

    console.log(" Opções:")
    console.log("[1] - Adicionar teste")
    console.log("[2] - Remover teste")
    console.log("[3] - Salvar alterações")
    console.log("[4] - Atualizar resultado de um teste")
    console.log("[0] - Voltar")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()
    if (opcao === "0") break

    if (opcao === "1") {
      console.log(" Testes disponíveis para adicionar:")
      testeManager.all().forEach((teste, i) => console.log(`${i + 1} - Tipo: ${teste.tipo} | Resultado: ${teste.resultado ?? "NÃO REALIZADO"}`))

      const idxStr = (await perguntar("Número do teste para adicionar: ")).trim()
      const idx = parseInt(idxStr, 10) - 1
      const lista = testeManager.all()
      if (isNaN(idx) || idx < 0 || idx >= lista.length) { console.log("Índice inválido."); continue }

      const testeSelecionado = lista[idx]!
      const jaExiste = (aeronave.testes ?? []).some(t => t.tipo === testeSelecionado.tipo && t.resultado === testeSelecionado.resultado)
      if (jaExiste) { console.log("Teste já associado à aeronave."); continue }

      aeronave.testes = aeronave.testes ?? []
      aeronave.testes.push(testeSelecionado)
      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log(`Teste do tipo "${testeSelecionado.tipo}" associado à aeronave.`)
    }

    else if (opcao === "2") {
      if (!aeronave.testes || aeronave.testes.length === 0) { console.log("Nenhum teste para remover."); continue }
      const idxStr = (await perguntar("Número do teste para remover: ")).trim()
      const idx = parseInt(idxStr, 10) - 1
      if (isNaN(idx) || idx < 0 || idx >= aeronave.testes.length) { console.log("Índice inválido."); continue }
      const removido = aeronave.testes.splice(idx, 1)
      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log(`Teste do tipo "${removido[0]!.tipo}" removido da aeronave.`)
    }

    else if (opcao === "3") {
      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log("Alterações salvas com sucesso.")
    }

    else if (opcao === "4") {
      const testes = aeronave.testes
      if (!testes || testes.length === 0) {
        console.log("Nenhum teste para atualizar.")
        continue
      }

      const idxStr = (await perguntar("Número do teste para atualizar o resultado: ")).trim()
      const idx = parseInt(idxStr, 10) - 1
      if (isNaN(idx) || idx < 0 || idx >= testes.length) {
        console.log("Índice inválido.")
        continue
      }

      const teste = testes[idx]
      if (!teste) {
        console.log("Erro ao acessar o teste. Índice inválido.")
        continue
      }

      const entrada = (await perguntar("Novo resultado do teste (APROVADO / REPROVADO / PENDENTE): ")).trim().toUpperCase()

      if (!(entrada in ResultadoTeste)) {
        console.log("Resultado inválido. Use: APROVADO, REPROVADO ou PENDENTE.")
        continue
      }

      teste.resultado = ResultadoTeste[entrada as keyof typeof ResultadoTeste]
      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log(`Resultado do teste "${teste.tipo}" atualizado para "${teste.resultado}".`)
    }


    else {
      console.log("Opção inválida.")
    }
  }
}


async function menuTestes() {
  testeManager.load()
  console.log("Testes carregados (se houver). ")
  while (true) {
    console.log(" === Menu Testes ===")
    console.log("[1] - Cadastrar Teste")
    console.log("[2] - Listar Testes")
    console.log("[3] - Registrar Resultado")
    console.log("[4] - Salvar Testes")
    console.log("[0] - Voltar")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()
    switch (opcao) {
      case "1": await cadastrarTeste(); break
      case "2": listarTestes(); break
      case "3": await registrarResultadoTeste(); break
      case "4": testeManager.save(); console.log("Testes salvos com sucesso."); break
      case "0": return
      default: console.log("Opção inválida.")
    }
  }
}

export { menuTestes, editarTestesDaAeronave }

