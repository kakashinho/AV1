import { Aeronave } from "./aeronave"
import * as fs from "fs"

export class Relatorio {
  aeronave: Aeronave
  cliente: string
  dataEntrega: Date

  constructor(aeronave: Aeronave, cliente: string, dataEntrega: Date) {
    this.aeronave = aeronave
    this.cliente = cliente
    this.dataEntrega = dataEntrega
  }

  gerar(): string {
    let texto = `Relatório da Aeronave - Código: ${this.aeronave.codigo}\n`
    texto += `Cliente: ${this.cliente}\n`
    texto += `Data de Entrega: ${this.dataEntrega.toDateString()}\n\n`

    texto += "Detalhes da Aeronave:\n"
    texto += this.aeronave.detalhes() + "\n"

    texto += "Peças Utilizadas:\n"
    this.aeronave.pecas.forEach((item, i) => {
      texto += `${i + 1}. ${item.peca.nome} - Tipo: ${item.peca.tipo} - Fornecedor: ${item.peca.fornecedor} - Status: ${item.peca.status} - Quantidade: ${item.quantidade}\n`
    })

    texto += "\nEtapas Realizadas:\n"
    this.aeronave.etapas.forEach((etapa, i) => {
      texto += `${i + 1}. ${etapa.nome} - Prazo: ${etapa.prazo.toDateString()} - Status: ${etapa.status} - Funcionários: ${etapa.listarFuncionarios().join(", ")}\n`
    })

    texto += "\nTestes Realizados:\n"
    this.aeronave.testes.forEach((teste, i) => {
      texto += `${i + 1}. Tipo: ${teste.tipo} - Resultado: ${teste.resultado ?? "Não realizado"}\n`
    })

    return texto
  }

  salvar(caminhoArquivo: string) {
    const conteudo = this.gerar()
    fs.writeFileSync(caminhoArquivo, conteudo, { encoding: "utf-8" })
    console.log(`Relatório salvo em ${caminhoArquivo}`)
  }
}
