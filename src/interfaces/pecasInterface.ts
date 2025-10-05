import { Peca } from "../modelo/peca"
import { TipoPeca, StatusPeca } from "../enums"
import { salvarDados, carregarDados } from "../persistencia"
import { perguntar } from "../input"
import { Aeronave } from "../modelo/aeronave"

class PecaManager {
  private pecas: Peca[] = []
  private caminho = "./src/dados/pecas.txt"

  load() {
    const dados = carregarDados(this.caminho)
    if (!dados) return
    this.pecas = dados.map((obj: any) => new Peca(obj.nome, obj.tipo, obj.fornecedor, obj.status))
  }

  save() { salvarDados(this.caminho, this.pecas) }
  
  all() { return this.pecas.slice() }

  add(peca: Peca) {
    this.pecas.push(peca)
  }
}

const pecaManager = new PecaManager()

async function criarPeca() {
  console.log("=== Cadastro de Peça ===")
  const nome = (await perguntar("Nome: ")).trim()
  const fornecedor = (await perguntar("Fornecedor: ")).trim()

  let tipoStr = (await perguntar("Tipo (NACIONAL | IMPORTADA): ")).toUpperCase().trim()
  if (!(tipoStr in TipoPeca)) { console.log("Tipo inválido."); return }
  const tipo = TipoPeca[tipoStr as keyof typeof TipoPeca]

  let statusStr = (await perguntar("Status (EM_PRODUCAO | EM_TRANSPORTE | PRONTA): ")).toUpperCase().trim()
  if (!(statusStr in StatusPeca)) { console.log("Status inválido."); return }
  const status = StatusPeca[statusStr as keyof typeof StatusPeca]

  const peca = new Peca(nome, tipo, fornecedor, status)
  pecaManager.add(peca)
  console.log("Peça cadastrada com sucesso.")
}

function listarPecas() {
  const pecas = pecaManager.all()
  if (pecas.length === 0) { console.log("Nenhuma peça cadastrada."); return }
  pecas.forEach((p, i) => console.log(`${i + 1}: ${p.nome} | Tipo: ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}`))
}

function listarPecasDaAeronave(aeronave: Aeronave) {
  if ((aeronave.pecas ?? []).length === 0) { console.log("Nenhuma peça associada."); return }
  aeronave.pecas.forEach((item, i) => {
    const { peca, quantidade } = item
    console.log(`${i + 1} - ${peca.nome} | Tipo: ${peca.tipo} | Fornecedor: ${peca.fornecedor} | Status: ${peca.status} | Quantidade: ${quantidade}`)
  })
}

async function atualizarPeca() {
  console.log("=== Atualizar Peça ===")
  listarPecas()
  const indice = parseInt((await perguntar("Número da peça para editar: ")).trim(), 10) - 1
  const lista = pecaManager.all()
  if (isNaN(indice) || indice < 0 || indice >= lista.length) { console.log("Índice inválido."); return }
  const peca = lista[indice]!

  while (true) {
    console.log(`\n--- Editando Peça: ${peca.nome} ---`)
    console.log(`[1] - Nome: ${peca.nome}`)
    console.log(`[2] - Tipo: ${peca.tipo}`)
    console.log(`[3] - Fornecedor: ${peca.fornecedor}`)
    console.log(`[4] - Status: ${peca.status}`)
    console.log("[0] - Sair da edição")

    const opcao = (await perguntar("O que você deseja editar? (0 a 4): ")).trim()
    switch (opcao) {
      case "1": peca.nome = (await perguntar("Novo nome: ")).trim(); break
      case "2": {
        let novoTipo = (await perguntar("Novo tipo (NACIONAL | IMPORTADA): ")).toUpperCase().trim()
        if (!(novoTipo in TipoPeca)) { console.log("Tipo inválido.") } else peca.tipo = TipoPeca[novoTipo as keyof typeof TipoPeca]
        break
      }
      case "3": peca.fornecedor = (await perguntar("Novo fornecedor: ")).trim(); break
      case "4": {
        let novoStatus = (await perguntar("Novo status (EM_PRODUCAO | EM_TRANSPORTE | PRONTA): ")).toUpperCase().trim()
        if (!(novoStatus in StatusPeca)) { console.log("Status inválido.") } else peca.status = StatusPeca[novoStatus as keyof typeof StatusPeca]
        break
      }
      case "0": return
      default: console.log("Opção inválida.")
    }
  }
}

async function editarPecasDaAeronave(aeronave: Aeronave, todasAeronaves: Aeronave[]) {
  pecaManager.load()
  while (true) {
    console.log(`\n=== Editar Peças da Aeronave ${aeronave.codigo} ===`)
    listarPecasDaAeronave(aeronave)

    console.log("\nOpções:")
    console.log("[1] - Adicionar peça")
    console.log("[2] - Remover peça")
    console.log("[3] - Atualizar status da peça")
    console.log("[4] - Salvar alterações")
    console.log("[0] - Voltar")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()

    if (opcao === "0") break

    if (opcao === "1") {
      listarPecas()
      const indice = parseInt((await perguntar("Número da peça para adicionar: ")).trim(), 10) - 1
      const lista = pecaManager.all()
      if (isNaN(indice) || indice < 0 || indice >= lista.length) { 
        console.log("Índice inválido.") 
        continue 
      }
      const peca = lista[indice]!
      const quantidade = parseInt((await perguntar(`Quantidade da peça "${peca.nome}": `)).trim(), 10)
      if (isNaN(quantidade) || quantidade <= 0) { 
        console.log("Quantidade inválida.") 
        continue 
      }
      aeronave.adicionarPeca(peca, quantidade)
      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log(`Peça "${peca.nome}" adicionada com quantidade ${quantidade}.`)
    }
    else if (opcao === "2") {
      if ((aeronave.pecas ?? []).length === 0) { 
        console.log("Nenhuma peça para remover.") 
        continue 
      }
      listarPecasDaAeronave(aeronave)
      const indice = parseInt((await perguntar("Número da peça para remover: ")).trim(), 10) - 1
      if (isNaN(indice) || indice < 0 || indice >= aeronave.pecas!.length) { 
        console.log("Índice inválido.") 
        continue 
      }
      const removida = aeronave.removerPeca(indice)
      if (removida) { 
        salvarDados("./src/dados/aeronaves.txt", todasAeronaves) 
        console.log(`Peça "${removida[0]!.peca.nome}" removida da aeronave.`) 
      }
    }
    else if (opcao === "3") {
      if ((aeronave.pecas ?? []).length === 0) {
        console.log("Nenhuma peça para atualizar o status.")
        continue
      }

      listarPecasDaAeronave(aeronave)
      const indice = parseInt((await perguntar("Número da peça para atualizar o status: ")).trim(), 10) - 1
      if (isNaN(indice) || indice < 0 || indice >= (aeronave.pecas ?? []).length) {
        console.log("Índice inválido.")
        continue
      }

      console.log("Status disponíveis:")
      Object.entries(StatusPeca).forEach(([key, valor], i) => {
        console.log(`${i + 1} - ${valor}`)
      })

      const statusIndice = parseInt((await perguntar("Escolha o novo status: ")).trim(), 10) - 1
      const statusValores = Object.values(StatusPeca)
      if (isNaN(statusIndice) || statusIndice < 0 || statusIndice >= statusValores.length) {
        console.log("Status inválido.")
        continue
      }

      const pecaAeronave = aeronave.pecas?.[indice]
      if (!pecaAeronave) {
        console.log("Peça não encontrada.")
        continue
      }

      pecaAeronave.peca.status = statusValores[statusIndice]!

      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log(`Status da peça "${pecaAeronave.peca.nome}" atualizado para "${statusValores[statusIndice]}".`)
    }

    else if (opcao === "4") {
      salvarDados("./src/dados/aeronaves.txt", todasAeronaves)
      console.log("Alterações salvas com sucesso.")
    }
    else {
      console.log("Opção inválida.")
    }
  }
}


async function menuPecas() {
  pecaManager.load()
  console.log("Peças carregadas (se houver).\n")
  while (true) {
    console.log("\n=== Menu Peças ===")
    console.log("[1] - Cadastrar Peça")
    console.log("[2] - Listar Peças")
    console.log("[3] - Atualizar Peça")
    console.log("[4] - Salvar Peças")
    console.log("[0] - Voltar")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()
    switch (opcao) {
      case "1": await criarPeca(); break
      case "2": listarPecas(); break
      case "3": await atualizarPeca(); break
      case "4": pecaManager.save(); console.log("Peças salvas."); break
      case "0": return
      default: console.log("Opção inválida.")
    }
  }
}

export { menuPecas, editarPecasDaAeronave }