import { TipoTeste, ResultadoTeste } from "../enums"

export class Teste {
  tipo: TipoTeste
  resultado: ResultadoTeste | null

  constructor(tipo: TipoTeste) {
    this.tipo = tipo
    this.resultado = null
  }

  registrarResultado(resultado: ResultadoTeste) {
    this.resultado = resultado
  }
}
