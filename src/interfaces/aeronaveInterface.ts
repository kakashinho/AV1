import { Aeronave } from "../modelo/aeronave"
import { Relatorio } from "../modelo/relatorio"
import { Etapa } from "../modelo/etapa"
import { Teste } from "../modelo/teste"
import { TipoAeronave } from "../enums"
import { salvarDados, carregarDados } from "../persistencia"
import { editarEtapasDaAeronave } from "./etapasInterface"
import { editarPecasDaAeronave } from "./pecasInterface"
import { editarTestesDaAeronave } from "./testesInterface"
import { perguntar } from "../input"

class AeronaveManager {
  private aeronaves: Aeronave[] = []
  private caminho = "./src/dados/aeronaves.txt"

  load() {
    const dados = carregarDados(this.caminho)
    if (!dados) return
    this.aeronaves = dados.map((obj: any) => new Aeronave(
      obj.codigo,
      obj.modelo,
      obj.tipo,
      obj.capacidade,
      obj.alcance
    ))

    this.aeronaves.forEach((a, i) => {
      a.pecas = dados[i].pecas ?? []
      a.etapas = (dados[i].etapas ?? []).map((e: any) => {
        const etapa = new Etapa(e.nome, new Date(e.prazo), e.status)
        etapa.funcionarios = e.funcionarios ?? []
        return etapa
      })

      a.testes = (dados[i].testes ?? []).map((t: any) => {
        const teste = new Teste(t.tipo)
        if (t.resultado) teste.registrarResultado(t.resultado)
        return teste
      })
    })
  }

  save() { salvarDados(this.caminho, this.aeronaves) }

  all() { return this.aeronaves.slice() }

  findByCodigo(codigo: string) { return this.aeronaves.find(a => a.codigo === codigo) }

  add(aeronave: Aeronave) {
    this.aeronaves.push(aeronave)
  }

  removeByCodigo(codigo: string) {
    const idx = this.aeronaves.findIndex(a => a.codigo === codigo)
    if (idx === -1) return false
    this.aeronaves.splice(idx, 1)
    return true
  }
}

const manager = new AeronaveManager()

async function criarAeronave() {
  console.log("=== Cadastro de Aeronave ===")

  const codigo = (await perguntar("Código (único): ")).trim()
  if (manager.findByCodigo(codigo)) {
    console.log("Código já cadastrado!")
    return
  }

  const modelo = (await perguntar("Modelo: ")).trim()

  let tipoStr = (await perguntar("Tipo (COMERCIAL / MILITAR): ")).toUpperCase().trim()
  if (!(tipoStr === "COMERCIAL" || tipoStr === "MILITAR")) { console.log("Tipo inválido."); return }
  const tipo = tipoStr === "COMERCIAL" ? TipoAeronave.COMERCIAL : TipoAeronave.MILITAR

  const capacidadeStr = (await perguntar("Capacidade (número): ")).trim()
  const capacidade = parseInt(capacidadeStr, 10)
  if (isNaN(capacidade)) { console.log("Capacidade inválida."); return }

  const alcanceStr = (await perguntar("Alcance (km): ")).trim()
  const alcance = parseInt(alcanceStr, 10)
  if (isNaN(alcance)) { console.log("Alcance inválido."); return }

  const aeronave = new Aeronave(codigo, modelo, tipo, capacidade, alcance)
  manager.add(aeronave)
  console.log("Aeronave cadastrada com sucesso! Não se esqueça de salvar.")
}

async function atualizarAeronave() {
  console.log("=== Atualização de Aeronave ===")
  const codigo = (await perguntar("Código (único): ")).trim()
  const aeronave = manager.findByCodigo(codigo)
  if (!aeronave) { console.log("Código não encontrado"); return }

  while (true) {
    console.log("\n--- Dados atuais da aeronave ---")
    console.log(`[1] - Modelo: ${aeronave.modelo}`)
    console.log(`[2] - Tipo: ${aeronave.tipo}`)
    console.log(`[3] - Capacidade: ${aeronave.capacidade}`)
    console.log(`[4] - Alcance: ${aeronave.alcance}`)
    console.log(`[5] - Peças: ${aeronave.pecas?.length ?? 0}`)
    console.log(`[6] - Etapas: ${aeronave.etapas?.length ?? 0}`)
    console.log(`[7] - Testes: ${aeronave.testes?.length ?? 0}`)
    console.log("[0] - Sair da edição")

    const opcao = (await perguntar("O que você deseja editar? (0 a 7): ")).trim()

    switch (opcao) {
      case "1": aeronave.modelo = (await perguntar("Novo modelo: ")).trim(); break
      case "2": {
        let novoTipo = (await perguntar("Novo tipo (COMERCIAL / MILITAR): ")).toUpperCase().trim()
        if (!(novoTipo === "COMERCIAL" || novoTipo === "MILITAR")) { console.log("Tipo inválido."); break }
        aeronave.tipo = novoTipo === "COMERCIAL" ? TipoAeronave.COMERCIAL : TipoAeronave.MILITAR
        break
      }
      case "3": {
        const novaCapacidade = parseInt((await perguntar("Nova capacidade: ")).trim(), 10)
        if (isNaN(novaCapacidade)) { console.log("Capacidade inválida."); break }
        aeronave.capacidade = novaCapacidade; break
      }
      case "4": {
        const novoAlcance = parseInt((await perguntar("Novo alcance (km): ")).trim(), 10)
        if (isNaN(novoAlcance)) { console.log("Alcance inválido"); break }
        aeronave.alcance = novoAlcance; break
      }
      case "5": await editarPecasDaAeronave(aeronave, manager.all()); break
      case "6": await editarEtapasDaAeronave(aeronave, manager.all()); break
      case "7": await editarTestesDaAeronave(aeronave, manager.all()); break
      case "0": return
      default: console.log("Opção inválida")
    }
  }
}

function listarAeronaves() {
  const lista = manager.all()
  if (lista.length === 0) { console.log("Nenhuma aeronave cadastrada."); return }
  lista.forEach((a, i) => {
    console.log(`${i + 1}: Código: ${a.codigo} | Modelo: ${a.modelo} | Tipo: ${a.tipo} | Capacidade: ${a.capacidade} | Alcance: ${a.alcance}`)
  })
}

async function menuAeronaves() {
  manager.load()
  console.log("Aeronaves carregadas (se houver).\n")

  while (true) {
    console.log("\n=== Menu de Aeronaves ===")
    console.log("[1]  - Cadastrar Aeronave")
    console.log("[2]  - Listar Aeronaves")
    console.log("[3]  - Atualizar Aeronave")
    console.log("[4]  - Remover Aeronave")
    console.log("[5]  - Listar uma Aeronave")
    console.log("[6]  - Salvar Aeronaves")
    console.log("[7]  - Editar Peças de uma Aeronave")
    console.log("[8]  - Editar Etapas de uma Aeronave")
    console.log("[9]  - Editar Testes de uma Aeronave")
    console.log("[10] - Gerar Relatório de uma Aeronave")
    console.log("[0]  - Voltar")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()

    switch (opcao) {
      case "1": await criarAeronave(); break
      case "2": listarAeronaves(); break
      case "3": await atualizarAeronave(); break
      case "4": {
        const codigo = (await perguntar("Código da aeronave a remover: ")).trim()
        if (!manager.removeByCodigo(codigo)) console.log("Aeronave não encontrada."); else console.log("Aeronave removida com sucesso.")
        break
      }
      case "5": {
        const codigo = (await perguntar("Código da aeronave: ")).trim()
        const aeronave = manager.findByCodigo(codigo)
        if (!aeronave) { console.log("Aeronave não encontrada."); break }
        console.log(aeronave.detalhes())
        break
      }
      case "6": manager.save(); console.log("Aeronaves salvas."); break
      case "7": {
        const codigo = (await perguntar("Código da aeronave: ")).trim()
        const aeronave = manager.findByCodigo(codigo)
        if (!aeronave) { console.log("Aeronave não encontrada."); break }
        await editarPecasDaAeronave(aeronave, manager.all())
        break
      }
      case "8": {
        const codigo = (await perguntar("Código da aeronave: ")).trim()
        const aeronave = manager.findByCodigo(codigo)
        if (!aeronave) { console.log("Aeronave não encontrada."); break }
        await editarEtapasDaAeronave(aeronave, manager.all())
        break
      }
      case "9": {
        const codigo = (await perguntar("Código da aeronave: ")).trim()
        const aeronave = manager.findByCodigo(codigo)
        if (!aeronave) { console.log("Aeronave não encontrada."); break }
        await editarTestesDaAeronave(aeronave, manager.all())
        break
      }
      case "10": {
        const codigo = (await perguntar("Código da aeronave: ")).trim()
        const aeronave = manager.findByCodigo(codigo)
        if (!aeronave) { console.log("Aeronave não encontrada."); break }

        const cliente = (await perguntar("Nome do cliente: ")).trim()
        const dataEntregaStr = (await perguntar("Data de entrega (YYYY-MM-DD): ")).trim()
        const dataEntrega = new Date(dataEntregaStr)
        if (isNaN(dataEntrega.getTime())) { console.log("Data inválida."); break }

        const relatorio = new Relatorio(aeronave, cliente, dataEntrega)
        const caminho = `./src/dados/relatorio_${codigo}.txt`
        relatorio.salvar(caminho)
        break
      }
      case "0": return
      default: console.log("Opção inválida!")
    }
  }
}

export { menuAeronaves, manager as aeronaveManager }

