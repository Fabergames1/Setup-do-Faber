# 🚀 Setup do Faber

Sistema moderno para gerenciamento de componentes de PC, wishlist de hardware e importação automática via Evernote.

---

## 📌 Sobre o Projeto

O **Setup do Faber** é uma aplicação web desenvolvida em React + TypeScript para organização de setups de computador, controle de componentes, histórico de alterações e importação automatizada de produtos.

A aplicação permite:

* 📦 Gerenciar componentes de PC
* 🔍 Buscar e organizar peças por categoria
* ⭐ Definir prioridades
* ✅ Marcar itens como comprados
* 📜 Manter histórico de alterações
* 📥 Importar múltiplas URLs automaticamente via Evernote
* 🔐 Autenticação com Supabase
* ☁️ Persistência de dados em tempo real

---

# 🖼️ Preview

> Interface moderna com visual futurista e foco em produtividade.

---

# 🛠️ Tecnologias Utilizadas

## Frontend

* React 18
* TypeScript
* Vite
* TailwindCSS
* Framer Motion
* Lucide React
* React Hot Toast

## Backend / Banco

* Supabase
* PostgreSQL
* Supabase Auth
* Row Level Security (RLS)

## Testes

* Vitest
* Testing Library
* JSDOM

---

# 📂 Estrutura do Projeto

```bash
project/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── context/
│   ├── lib/
│   ├── test/
│   ├── App.tsx
│   └── main.tsx
│
├── supabase/
│   └── migrations/
│
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

# ⚙️ Funcionalidades

## 📦 Gerenciamento de Componentes

* Adicionar componentes manualmente
* Editar informações
* Remover componentes
* Definir prioridade
* Marcar item como comprado
* Buscar componentes em tempo real

## 📥 Importação via Evernote

O sistema consegue:

* Extrair URLs automaticamente
* Identificar links válidos
* Importar múltiplos produtos em lote
* Categorizar componentes automaticamente
* Adicionar peças diretamente ao banco de dados

## 📜 Histórico de Alterações

Registro completo de:

* Criação
* Atualização
* Exclusão
* Alterações de status

## 🔐 Sistema de Autenticação

* Cadastro
* Login
* Logout
* Persistência de sessão
* Integração com Supabase Auth

---

# 🧠 Categorias Suportadas

O projeto possui suporte automático para categorias como:

* CPU
* GPU
* Memória RAM
* SSD
* HDD
* Fonte
* Placa-mãe
* Gabinete
* Water Cooler
* Monitor
* Periféricos

---

# 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:

* Node.js 18+
* npm ou yarn
* Conta no Supabase

---

# 🔧 Instalação

## 1️⃣ Clone o projeto

```bash
git clone https://github.com/seu-usuario/setup-do-faber.git
```

## 2️⃣ Entre na pasta

```bash
cd setup-do-faber
```

## 3️⃣ Instale as dependências

```bash
npm install
```

---

# 🔑 Configuração do Supabase

## Crie um arquivo `.env`

Use o `.env.example` como base:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

# 🗄️ Configuração do Banco

Execute as migrations dentro da pasta:

```bash
supabase/migrations/
```

As migrations configuram:

* Tabelas
* Índices
* Histórico
* Policies
* Segurança RLS

---

# ▶️ Executando o Projeto

## Ambiente de desenvolvimento

```bash
npm run dev
```

Acesse:

```bash
http://localhost:5173
```

---

# 🧪 Testes

## Rodar testes

```bash
npm run test
```

## Interface visual de testes

```bash
npm run test:ui
```

## Cobertura de testes

```bash
npm run test:coverage
```

---

# 📦 Build de Produção

```bash
npm run build
```

Pré-visualização local:

```bash
npm run preview
```

---

# 🔒 Segurança

O projeto utiliza:

* Row Level Security (RLS)
* Sessões persistentes
* Autenticação segura via JWT
* Policies por usuário
* Proteção de rotas

---

# 🎨 Interface

Características visuais:

* Design futurista
* Responsivo
* Dark mode
* Animações suaves
* Componentes reutilizáveis
* Feedback visual em tempo real

---

# 📚 Scripts Disponíveis

| Script                  | Descrição                            |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Inicia o ambiente de desenvolvimento |
| `npm run build`         | Gera build de produção               |
| `npm run preview`       | Visualiza build local                |
| `npm run lint`          | Executa lint                         |
| `npm run test`          | Executa testes                       |
| `npm run test:ui`       | Interface visual de testes           |
| `npm run test:coverage` | Cobertura de testes                  |

---

# 🧩 Principais Dependências

```json
{
  "react": "^18",
  "typescript": "^5",
  "vite": "^5",
  "@supabase/supabase-js": "^2",
  "framer-motion": "^10",
  "tailwindcss": "^3"
}
```

---

# 📈 Melhorias Futuras

* 📊 Dashboard avançado
* 🤖 IA para recomendação de peças
* 🔔 Alertas de preço
* 🌐 Integração com APIs de lojas
* 📱 Aplicativo mobile
* 🛒 Comparador de preços
* 📦 Exportação de setup
* ☁️ Backup automático

---

# 🤝 Contribuição

Contribuições são bem-vindas.

## Fluxo recomendado

```bash
# Fork do projeto
# Crie sua branch

git checkout -b feature/minha-feature

# Commit

git commit -m "feat: minha nova feature"

# Push

git push origin feature/minha-feature
```

---

# 📝 Licença

Este projeto está sob a licença MIT.

---

# 👨‍💻 Autor

Desenvolvido por **Fabricio Perrone**.

---

# ⭐ Considerações Finais

O Setup do Faber foi criado com foco em organização, praticidade e gerenciamento moderno de hardware, utilizando tecnologias atuais do ecossistema React.

Se este projeto ajudou você, considere deixar uma ⭐ no repositório.
