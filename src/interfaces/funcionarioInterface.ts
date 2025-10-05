import { Funcionario } from "../modelo/funcionario"
import { NivelPermissao } from "../enums"
import { salvarDados, carregarDados } from "../persistencia"
import { perguntar } from "../input"

class FuncionarioManager {
  private funcionarios: Funcionario[] = []
  private caminho = "./src/dados/funcionarios.txt"

  load() {
    const dados = carregarDados(this.caminho)
    if (!dados) return
    this.funcionarios = dados.map((obj: any) => new Funcionario(
      obj.id, obj.nome, obj.telefone, obj.endereco, obj.usuario, obj.senha, obj.nivelPermissao
    ))
  }

  save() { salvarDados(this.caminho, this.funcionarios) }
  all() { return this.funcionarios.slice() }
  findById(id: string) { return this.funcionarios.find(f => f.id === id) }
  add(func: Funcionario) { this.funcionarios.push(func) }
}

const funcManager = new FuncionarioManager()
funcManager.load()

async function criarFuncionario() {
  console.log("=== Cadastro de Funcionário ===")
  const id = (await perguntar("ID (único): ")).trim()
  if (funcManager.findById(id)) { console.log("ID já cadastrado!"); return }

  const nome = (await perguntar("Nome: ")).trim()
  const telefone = (await perguntar("Telefone: ")).trim()
  const endereco = (await perguntar("Endereço: ")).trim()
  const usuario = (await perguntar("Usuário: ")).trim()
  const senha = (await perguntar("Senha: ")).trim()

  let nivelStr = (await perguntar("Nível de Permissão (ADMIN / ENGENHEIRO / OPERADOR): ")).toUpperCase().trim()
  if (!(nivelStr === "ADMIN" || nivelStr === "OPERADOR" || nivelStr === "ENGENHEIRO")) { console.log("Nível inválido."); return }
  const nivel = nivelStr === "ADMIN" ? NivelPermissao.ADMIN : nivelStr === "OPERADOR" ? NivelPermissao.OPERADOR : NivelPermissao.ENGENHEIRO

  const funcionario = new Funcionario(id, nome, telefone, endereco, usuario, senha, nivel)
  funcManager.add(funcionario)
  console.log("Funcionário cadastrado com sucesso! Não se esqueça de salvar!")
}

async function atualizarFuncionario() {
  console.log("=== Atualização de Funcionário ===")
  const id = (await perguntar("ID do Funcionário: ")).trim()
  const funcionario = funcManager.findById(id)
  if (!funcionario) { console.log("Funcionário não encontrado."); return }

  while (true) {
    console.log(`\n[1] - Nome: ${funcionario.nome}\n[2] - Telefone: ${funcionario.telefone}\n[3] - Endereço: ${funcionario.endereco}\n[4] - Usuário: ${funcionario.usuario}\n[5] - Senha: ****\n[6] - Nível: ${funcionario.nivelPermissao}\n[0] - Sair da edição`)
    const opcao = (await perguntar("O que deseja editar? ")).trim()
    switch (opcao) {
      case "1": funcionario.nome = (await perguntar("Novo nome: ")).trim(); break
      case "2": funcionario.telefone = (await perguntar("Novo telefone: ")).trim(); break
      case "3": funcionario.endereco = (await perguntar("Novo endereço: ")).trim(); break
      case "4": funcionario.usuario = (await perguntar("Novo usuário: ")).trim(); break
      case "5": funcionario.senha = (await perguntar("Nova senha: ")).trim(); break
      case "6": {
        let novoNivel = (await perguntar("Novo nível (ADMIN / ENGENHEIRO / OPERADOR): ")).toUpperCase().trim()
        if (!(novoNivel === "ADMIN" || novoNivel === "OPERADOR" || novoNivel === "ENGENHEIRO")) { console.log("Nível inválido.") }
        else funcionario.nivelPermissao = novoNivel === "ADMIN" ? NivelPermissao.ADMIN : novoNivel === "OPERADOR" ? NivelPermissao.OPERADOR : NivelPermissao.ENGENHEIRO
        break
      }
      case "0": return
      default: console.log("Opção inválida.")
    }
  }
}

function listarFuncionarios() {
  const lista = funcManager.all()
  if (lista.length === 0) { console.log("Nenhum funcionário cadastrado."); return }
  lista.forEach((f, i) => console.log(`${i + 1}: ${f.nome} | ID: ${f.id} | Usuário: ${f.usuario} | Nível: ${f.nivelPermissao}`))
}

async function menuFuncionario() {
  funcManager.load()
  while (true) {
    console.log("\n=== Menu Funcionários ===")
    console.log("[1] - Cadastrar Funcionário")
    console.log("[2] - Listar Funcionários")
    console.log("[3] - Atualizar Funcionário")
    console.log("[4] - Salvar")
    console.log("[0] - Voltar")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()
    switch (opcao) {
      case "1": await criarFuncionario(); break
      case "2": listarFuncionarios(); break
      case "3": await atualizarFuncionario(); break
      case "4": funcManager.save(); console.log("Funcionários salvos."); break
      case "0": return
      default: console.log("Opção inválida!")
    }
  }
}

export { menuFuncionario }