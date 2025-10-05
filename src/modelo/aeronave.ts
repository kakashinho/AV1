import { TipoAeronave } from "../enums"
import { Peca } from "./peca"
import { Etapa } from "./etapa"
import { Teste } from "./teste"

export class Aeronave {
  codigo: string
  modelo: string
  tipo: TipoAeronave
  capacidade: number
  alcance: number
  pecas: { peca: Peca, quantidade: number }[]
  etapas: Etapa[]
  testes: Teste[]

  constructor(
    codigo: string,
    modelo: string,
    tipo: TipoAeronave,
    capacidade: number,
    alcance: number
  ) {
    this.codigo = codigo
    this.modelo = modelo
    this.tipo = tipo
    this.capacidade = capacidade
    this.alcance = alcance
    this.pecas = []
    this.etapas = []
    this.testes = []
  }

  adicionarPeca(peca: Peca, quantidade: number) {
  const existente = this.pecas.find(p => p.peca.nome === peca.nome)
    if (existente) {
      existente.quantidade += quantidade
    } else {
      this.pecas.push({ peca, quantidade })
    }
  }

  removerPeca(indice: number) {
    if (indice >= 0 && indice < this.pecas.length) {
      return this.pecas.splice(indice, 1)
    }
    return null
  }


  adicionarEtapa(etapa: Etapa) {
    this.etapas.push(etapa)
  }

  adicionarTeste(teste: Teste) {
    this.testes.push(teste)
  }

  detalhes(): string {
    const detalhesPecas = this.pecas.length > 0 ? this.pecas.map(p => `    - ${p.peca.nome} | Tipo: ${p.peca.tipo} | Fornecedor: ${p.peca.fornecedor} | Status: ${p.peca.status} | Quantidade: ${p.quantidade}`).join("\n")
    : "    Nenhuma peça cadastrada."

    
    return `
      Código: ${this.codigo}
      Modelo: ${this.modelo}
      Tipo: ${this.tipo}
      Capacidade: ${this.capacidade}
      Alcance: ${this.alcance}
      Peças: ${detalhesPecas}
      Etapas: ${this.etapas.length}
      Testes: ${this.testes.length}
    `
  }
}
