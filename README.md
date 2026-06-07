# ERP Frontend — Sistema de Gestão Empresarial

Interface web do ERP desenvolvida com **React + TypeScript + Vite**, consumindo a [API REST do back-end](https://github.com/wandersonjafe/erp).

> Projeto de portfólio para demonstrar conhecimento em desenvolvimento front-end moderno com foco em autenticação JWT, organização por contextos e boas práticas com TypeScript.

---

## 🚀 Tecnologias

- **React 18** + **TypeScript** — base da aplicação
- **Vite** — build tool e dev server
- **Tailwind CSS** — estilização utilitária
- **Axios** — requisições HTTP com interceptors de JWT
- **React Router v6** — roteamento com rotas protegidas
- **Lucide React** — ícones SVG

---

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── Layout.tsx        → estrutura base das páginas autenticadas
│   ├── Sidebar.tsx       → menu lateral com ícones e navegação
│   └── PrivateRoute.tsx  → proteção de rotas autenticadas
├── context/
│   ├── AuthContext.tsx   → contexto global de autenticação
│   └── ThemeContext.tsx  → contexto de tema claro/escuro
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Clientes.tsx
│   ├── ClienteForm.tsx
│   ├── Produtos.tsx
│   ├── ProdutoForm.tsx
│   ├── ProdutoEditar.tsx
│   └── Vendas.tsx
├── services/
│   └── api.ts            → Axios configurado com interceptors JWT
└── types/
    └── index.ts          → interfaces TypeScript globais
```

---

## 📦 Funcionalidades

### Autenticação
- Login com e-mail e senha
- Token JWT armazenado no `localStorage`
- Redirecionamento automático para `/login` em token expirado (401)
- Rotas protegidas com `PrivateRoute`

### Tema
- Alternância entre modo claro e escuro
- Paleta baseada em variáveis CSS — todas as páginas respondem automaticamente ao tema

### Dashboard
- Cards com total de vendas, valor vendido, vendas em aberto, clientes e produtos
- Barras de status clicáveis — ao clicar em Fechadas, Abertas ou Canceladas, a tabela ao lado filtra automaticamente
- Tabela de vendas filtrada por status com nome do cliente, valor e badge de status

### Clientes
- Listagem, cadastro, edição e exclusão
- Validação de CPF e endereço integrada ao back-end

### Produtos
- Listagem, cadastro, edição e exclusão
- Exibição de estoque e categoria com badges visuais

### Vendas
- Abertura de venda com seleção de cliente
- Carrinho visual em tempo real — produtos adicionados aparecem na tabela com subtotal e total
- Botões de ação fixos: **Fechar Venda** e **Cancelar Venda**
- Histórico com filtros por status: Todas, Abertas, Fechadas, Canceladas
- Busca por nome do cliente ou ID da venda
- Linhas expansíveis no histórico — clique para ver os itens de cada venda
- Vendas abertas com botão **Continuar** para retomar o carrinho e botão **✕** para cancelar direto pelo histórico

---

## ▶️ Como rodar localmente

### Pré-requisitos
- Node.js 20+
- Back-end rodando em `http://localhost:8080`

### Instalação

```bash
git clone https://github.com/wandersonjafe/erp-frontend.git
cd erp-frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## ⚙️ Variáveis de ambiente

Crie um arquivo `.env.production` na raiz do projeto antes do build:

```env
VITE_API_URL=https://sua-api.up.railway.app
```

Em desenvolvimento, a URL padrão é `http://localhost:8080` (configurada em `src/services/api.ts`).

---

## 🔗 Back-end

O back-end desta aplicação está disponível em:
👉 [github.com/wandersonjafe/erp](https://github.com/wandersonjafe/erp)

---

## 👨‍💻 Autor

Feito por **Wanderson Jafé** — [LinkedIn](https://linkedin.com/in/wandersonjafe)