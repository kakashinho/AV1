import * as readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

export const perguntar = (pergunta: string) =>
  new Promise<string>((resolve) => rl.question(pergunta, resolve))

export const fecharInput = () => rl.close()
