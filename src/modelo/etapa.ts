import { StatusEtapa } from "../enums"
import { Funcionario } from "./funcionario"

export class Etapa {
  nome: string
  prazo: Date
  status: StatusEtapa
  funcionarios: Funcionario[] = []

  constructor(nome: string, prazo: Date, status: StatusEtapa = StatusEtapa.PENDENTE) {
    this.nome = nome
    this.prazo = prazo
    this.status = status
  }

  iniciar() {
    if (this.status === StatusEtapa.PENDENTE) {
      this.status = StatusEtapa.ANDAMENTO
    } else {
      console.log(`Etapa ${this.nome} não pode ser iniciada, status atual: ${this.status}`)
    }
  }

  finalizar() {
    if (this.status === StatusEtapa.ANDAMENTO) {
      this.status = StatusEtapa.CONCLUIDA
    } else {
      console.log(`Etapa ${this.nome} não pode ser finalizada, status atual: ${this.status}`)
    }
  }

  associarFuncionario(funcionario: Funcionario) {
    const existe = this.funcionarios.find(f => f.id === funcionario.id)
    if (!existe) {
      this.funcionarios.push(funcionario)
    } else {
      console.log(`Funcionário ${funcionario.nome} já está associado à etapa ${this.nome}`)
    }
  }

  listarFuncionarios(): string[] {
    return this.funcionarios.map(f => f.nome)
  }
}
