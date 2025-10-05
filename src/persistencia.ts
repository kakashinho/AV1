import * as fs from "fs"
import * as path from "path"

export function salvarDados(nomeArquivo: string, dados: any) {
  const pasta = path.dirname(nomeArquivo)
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta)
  
  const json = JSON.stringify(dados, null, 2)
  fs.writeFileSync(nomeArquivo, json, "utf-8")
  console.log(`Dados salvos em ${nomeArquivo}`)
}

export function carregarDados(caminho: string): any[] {
  try {

    const dir = path.dirname(caminho)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    if (!fs.existsSync(caminho)) {
      fs.writeFileSync(caminho, "[]")
      return []
    }

    const dados = fs.readFileSync(caminho, "utf-8").trim()
    if (!dados) return []

    return JSON.parse(dados)
  } catch (error) {
    console.error(`Erro ao carregar dados de ${caminho}:`, error)
    return []
  }
}
