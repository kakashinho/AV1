## ▶️ Como Executar o Projeto

### 📦 Instalação
Antes de rodar o sistema, instale as dependências com o seguinte comando:

```bash
npm install
```

### 🤖 Execução Automático
Executa o sistema com comandos simulados definidos no arquivo input.txt

```bash
npx ts-node src/autoRunner.ts
```

###  🚀 Execução Manual
Permite usar o sistema diretamente via terminal, digitando os comandos:

```bash
npx ts-node src/index.ts
```

# ✈️ Aerocode CLI System

Sistema de linha de comando (CLI) desenvolvido em **TypeScript** para simular o processo completo de **produção de aeronaves** civis e militares, desde o cadastro inicial até a entrega final ao cliente.

Este é o **primeiro produto mínimo viável (MVP)** da Aerocode, uma empresa fictícia especializada no desenvolvimento de softwares para a indústria aeroespacial brasileira.

---

## 🧠 Objetivo

Simular e informatizar o processo de fabricação de aeronaves inspirado na cadeia produtiva de empresas como a **Embraer**, controlando:

- Cadastro e gerenciamento de aeronaves
- Registro de peças e etapas de produção
- Atribuição e autenticação de funcionários
- Execução e registro de testes
- Geração de relatório final da aeronave
- Persistência de dados em arquivos `.txt`

---

## 🛠️ Tecnologias Utilizadas

- **TypeScript** — Linguagem principal do projeto
- **Node.js** — Runtime de execução
- **CLI (Command-Line Interface)** — Interface baseada em comandos de texto
- **Arquivos `.txt` (ASCII)** — Para armazenamento persistente dos dados

---

## ⚙️ Funcionalidades Principais

### ✈️ Aeronaves
- Cadastro de aeronaves com:
  - Código único
  - Modelo
  - Tipo (Comercial ou Militar)
  - Capacidade
  - Alcance
- Associação com peças, etapas e testes
- Exibição detalhada das informações

### 🔩 Peças
- Nome, tipo (Nacional/Importada), fornecedor, status (Produção, Transporte, Pronta)
- Atualização de status
- Associação com aeronaves

### 🧱 Etapas de Produção
- Nome, prazo e status (Pendente, Em andamento, Concluída)
- Avanço condicional baseado na ordem lógica
- Associação com funcionários

### 👷 Funcionários
- Cadastro com: ID, nome, telefone, endereço, usuário, senha, nível de permissão
- Níveis de permissão: Administrador, Engenheiro, Operador
- Autenticação para ações restritas
- Designação a etapas específicas

### 🧪 Testes
- Tipos: Elétrico, Hidráulico, Aerodinâmico
- Resultados: Aprovado, Reprovado
- Registro e consulta de testes

### 🧾 Relatórios
- Geração de relatório final da aeronave
- Inclui:
  - Dados da aeronave
  - Etapas concluídas
  - Peças utilizadas
  - Testes realizados
  - Nome do cliente e data de entrega
- Exportado como arquivo `.txt`

---

## 🗃️ Estrutura dos Arquivos

Todos os dados são persistidos em arquivos de texto simples:

```bash
/dados
├── aeronaves.txt
├── pecas.txt
├── etapas.txt
├── funcionarios.txt
├── testes.txt
├── relatorio-<codigo>.txt
```