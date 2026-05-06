# Frontend do Deefy

Aplicação React + Vite trazida da branch `grupo4-front` e organizada dentro da pasta `frontend` deste repositório.

## Requisitos

- Node.js 20+
- npm

## Rodando localmente

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Garanta que o backend Spring Boot esteja rodando em `http://localhost:8080`.

## Variáveis de ambiente

Crie um arquivo `.env` opcional na pasta `frontend`:

```bash
VITE_API_URL=http://localhost:8080
VITE_STORAGE_TOKEN_KEY=@deefy-token
```

## Rotas atuais

- `/` tela inicial
- `/login` autenticação
- `/registration` cadastro
- `/forgot-password` recuperação visual de senha
- `/preferences` preferências
- `/home` home/sidebar inicial
