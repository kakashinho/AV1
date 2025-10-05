import { perguntar, fecharInput } from "./input"
import { salvarDados, carregarDados } from "./persistencia"
import { NivelPermissao } from "./enums"
import chalk from "chalk"
import { Funcionario } from "./modelo/funcionario"
import { menuFuncionario } from "./interfaces/funcionarioInterface"
import { menuAeronaves } from "./interfaces/aeronaveInterface"
import { menuPecas } from "./interfaces/pecasInterface"
import { menuEtapas } from "./interfaces/etapasInterface"
import { menuTestes } from "./interfaces/testesInterface"

let funcionarios: Funcionario[] = []

function carregarFuncionarios(): void {
  const dados = carregarDados("./src/dados/funcionarios.txt")
  if (dados) {
    funcionarios = dados.map((obj: any) => new Funcionario(
      obj.id,
      obj.nome,
      obj.telefone,
      obj.endereco,
      obj.usuario,
      obj.senha,
      obj.nivelPermissao
    ))
  }
}

async function cadastrarPrimeiroAdmin(): Promise<void> {
  console.log("\nNenhum funcionário encontrado. Cadastre o primeiro funcionário como ADMIN.\n")

  const id = (await perguntar("ID (único): ")).trim()
  const nome = (await perguntar("Nome: ")).trim()
  const telefone = (await perguntar("Telefone: ")).trim()
  const endereco = (await perguntar("Endereço: ")).trim()
  const usuario = (await perguntar("Usuário: ")).trim()
  const senha = (await perguntar("Senha: ")).trim()

  const admin = new Funcionario(id, nome, telefone, endereco, usuario, senha, NivelPermissao.ADMIN)
  funcionarios.push(admin)

  salvarDados("./src/dados/funcionarios.txt", funcionarios)
  console.log("Administrador cadastrado com sucesso!\n")
}

async function loginFuncionario(): Promise<Funcionario | null> {
  console.log("\n=== Login ===")
  const usuario = (await perguntar("Usuário: ")).trim()
  const senha = (await perguntar("Senha: ")).trim()

  const funcionario = funcionarios.find(f => f.autenticar(usuario, senha))

  if (!funcionario) {
    console.log(" Usuário ou senha inválidos.")
    return null
  }

  console.log(`Bem-vindo, ${funcionario.nome} (${funcionario.nivelPermissao})`)
  return funcionario
}

async function menuPrincipal(funcionario: Funcionario) {
  while (true) {
    console.log(`\n=== Menu Principal (${funcionario.nivelPermissao}) ===`)

    if (
      funcionario.nivelPermissao === NivelPermissao.ADMIN ||
      funcionario.nivelPermissao === NivelPermissao.ENGENHEIRO
    ) {
      console.log("[1] - Gerenciar Aeronaves")
    }

    if (funcionario.nivelPermissao === NivelPermissao.ADMIN) {
      console.log("[2] - Gerenciar Funcionários")
    }

    console.log("[3] - Gerenciar Peças")
    console.log("[4] - Gerenciar Etapas")

    if (
      funcionario.nivelPermissao === NivelPermissao.ADMIN ||
      funcionario.nivelPermissao === NivelPermissao.ENGENHEIRO
    ) {
      console.log("[5] - Gerenciar Testes")
    }

    console.log("[0] - Logout")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()

    switch (opcao) {
      case "1":
        if (
          funcionario.nivelPermissao === NivelPermissao.ADMIN ||
          funcionario.nivelPermissao === NivelPermissao.ENGENHEIRO
        ) { await menuAeronaves()
        } else {
          console.log(" Acesso negado. Permissão insuficiente.")
        }
        break

      case "2":
        if (funcionario.nivelPermissao === NivelPermissao.ADMIN) {
          await menuFuncionario()
        } else {
          console.log(" Acesso negado. Apenas administradores podem acessar.")
        }
        break

      case "3":
        await menuPecas()
        break

      case "4":
        await menuEtapas()
        break

      case "5":
        if (
          funcionario.nivelPermissao === NivelPermissao.ADMIN ||
          funcionario.nivelPermissao === NivelPermissao.ENGENHEIRO
        ) { await menuTestes()
        } else {
          console.log(" Acesso negado. Apenas administradores ou engenheiros podem acessar.")
        }
        break

      case "0":
        return

      default:
        console.log(" Opção inválida.")
    }
  }
}

export function printLogo() {
  const logoLines = [
    "    ___                                           __      ",
    "   /   |  ___    _____  ____   _____  ____   ____/ /  ___ ",
    "  / /| | / _ \\  / ___/ / __ \\ / ___/ / __ \\ / __  /  / _ \\",
    " / ___ |/  __/ / /    / /_/ // /__  / /_/ // /_/ /  /  __/",
    "/_/  |_|\\___/ /_/     \\____/ \\___/  \\____/ \\__,_/   \\___/ ",
    "                                                         ",
  ]

  const colors = [chalk.yellow, chalk.green, chalk.cyan, chalk.blue, chalk.red, chalk.magenta]

  logoLines.forEach((line, i) => {
    const color = colors[i % colors.length]!
    console.log(color(line))
  })
}

async function menuInicial() {
  printLogo()
  carregarFuncionarios()

  if (funcionarios.length === 0) {
    await cadastrarPrimeiroAdmin()
    carregarFuncionarios()
  }

  while (true) {
    carregarFuncionarios()
    console.log("\n=== Menu Inicial ===")
    console.log("[1] - Login")
    console.log("[0] - Sair")

    const opcao = (await perguntar("Escolha uma opção: ")).trim()

    switch (opcao) {
      case "1":
        const funcionario = await loginFuncionario()
        if (funcionario) await menuPrincipal(funcionario)
        break
      case "0":
        fecharInput()
        process.exit(0)
      default:
        console.log(" Opção inválida.")
    }
  }
}

export async function iniciarSistema() {
  await menuInicial()
}