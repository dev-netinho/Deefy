# 🎵 Deefy — Front-end

> Interface web do Deefy, uma plataforma de streaming de música com design moderno, integração com API REST e experiência de usuário fluida.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias e Bibliotecas](#-tecnologias-e-bibliotecas)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Arquitetura e Decisões Técnicas](#-arquitetura-e-decisões-técnicas)
- [Páginas e Funcionalidades](#-páginas-e-funcionalidades)
- [Componentes](#-componentes)
- [Serviços (API Layer)](#-serviços-api-layer)
- [Hooks Customizados](#-hooks-customizados)
- [Segurança](#-segurança)
- [Integração com o Back-end](#-integração-com-o-back-end)
- [Scripts Disponíveis](#-scripts-disponíveis)

---

## 🌐 Visão Geral

O Deefy Front-end é uma Single Page Application (SPA) construída com **React 19** e **Vite 8**, responsável por toda a interface do usuário. Ele se comunica com a API REST do back-end (Spring Boot) para autenticação, listagem e busca de músicas.

**URL de produção:** `https://deefy.olua.me`

---

## 🛠️ Tecnologias e Bibliotecas

### Core
| Pacote | Versão | Finalidade |
|--------|--------|------------|
| `react` | ^19.2.4 | Biblioteca principal de UI |
| `react-dom` | ^19.2.4 | Renderização React no DOM |
| `vite` | ^8.0.4 | Build tool e dev server |

### Roteamento
| Pacote | Versão | Finalidade |
|--------|--------|------------|
| `react-router-dom` | ^7.14.1 | Gerenciamento de rotas SPA com proteção de acesso |

### Requisições HTTP
| Pacote | Versão | Finalidade |
|--------|--------|------------|
| `axios` | ^1.15.0 | Cliente HTTP com interceptors para JWT e tratamento global de erros |

### UI e Componentes
| Pacote | Versão | Finalidade |
|--------|--------|------------|
| `react-icons` | ^5.6.0 | Biblioteca de ícones (Material Design, Font Awesome, Ionicons) |
| `react-loading-skeleton` | ^3.5.0 | Placeholders animados (shimmer) durante carregamento de dados |
| `sonner` | ^2.0.7 | Sistema de notificações (toasts) com tema dark customizado |
| `react-pro-sidebar` | ^1.1.0 | Base para componente de sidebar (desktop) |

### Dev Tools
| Pacote | Versão | Finalidade |
|--------|--------|------------|
| `eslint` | ^9.39.4 | Linting de código |
| `@vitejs/plugin-react` | ^6.0.1 | Suporte a JSX e Fast Refresh |
| `babel-plugin-react-compiler` | ^1.0.0 | Compilador experimental do React |

---

## 📁 Estrutura de Pastas

```
client/
├── public/                      # Assets estáticos públicos
├── src/
│   ├── assets/                  # Imagens e SVGs (logo, backgrounds)
│   ├── components/              # Componentes reutilizáveis
│   │   ├── ButtonSpinner.jsx    # Spinner de carregamento para botões
│   │   ├── EmptyState.jsx       # Tela de resultado vazio na busca
│   │   ├── FeaturedSection.jsx  # Seção de playlists em destaque
│   │   ├── Header.jsx           # Cabeçalho com saudação e botão de config
│   │   ├── MusicPlayer.jsx      # Player de música global
│   │   ├── SearchBar.jsx        # Barra de pesquisa
│   │   ├── Sidebar.jsx          # Menu lateral (desktop) e nav inferior (mobile)
│   │   ├── SongList.jsx         # Lista de músicas em formato de tabela
│   │   └── SongListSkeleton.jsx # Skeleton loader para a lista de músicas
│   ├── hooks/                   # Hooks customizados do React
│   │   ├── useDebounce.js       # Debounce de valores (evita chamadas desnecessárias)
│   │   └── useMusicSearch.js    # Lógica de busca de músicas na API
│   ├── mocks/                   # Dados mockados temporários
│   │   └── musicData.js         # Playlists em destaque (mock até integração completa)
│   ├── pages/                   # Telas da aplicação
│   │   ├── Configuration.jsx    # Tela de configurações de perfil
│   │   ├── ForgotPass.jsx       # Tela de recuperação de senha
│   │   ├── home.jsx             # Tela principal (Home)
│   │   ├── Login.jsx            # Tela de login
│   │   ├── Preferences.jsx      # Tela de preferências musicais
│   │   ├── Registration.jsx     # Tela de cadastro
│   │   └── Welcome.jsx          # Tela de boas-vindas
│   ├── services/                # Camada de comunicação com a API
│   │   ├── api.js               # Instância Axios configurada (interceptors, JWT)
│   │   └── musicService.js      # Funções para endpoints de música
│   ├── utils/                   # Utilitários globais
│   │   ├── auth.js              # Gerenciamento de token JWT no localStorage
│   │   └── musicToast.jsx       # Funções padronizadas de notificação (toasts)
│   ├── index.css                # Estilos globais e design tokens
│   └── main.jsx                 # Entry point: roteamento, guards e providers
├── .env.local                   # Variáveis de ambiente locais (não versionado)
├── .gitignore
└── package.json
```

---

## ✅ Pré-requisitos

- **Node.js** v18 ou superior
- **npm** v9 ou superior
- Back-end Deefy em execução (local ou em produção)

---

## 🚀 Instalação e Execução

**1. Instale as dependências:**
```bash
npm install
```

**2. Configure as variáveis de ambiente** (veja a seção abaixo).

**3. Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`.

---

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz da pasta `client/`. Esse arquivo **nunca** deve ser versionado (já está no `.gitignore`).

```env
# URL base da API. Se não definido, aponta para produção automaticamente.
VITE_API_URL=http://localhost:8080

# (Opcional) Chave usada para armazenar o token no localStorage
VITE_STORAGE_TOKEN_KEY=@deefy-token
```

> **Se `VITE_API_URL` não for definido**, o front-end aponta automaticamente para a API de produção em `https://deefy.olua.me/api/v1`.

---

## 🏗️ Arquitetura e Decisões Técnicas

### Gerenciamento de Estado
Não utiliza Redux ou Zustand. O estado é gerenciado localmente com `useState` e `useEffect` por ser um projeto de escopo controlado. A comunicação entre componentes distantes ocorre via props ou através dos hooks customizados.

### Camada de API
Toda comunicação com o back-end passa pela instância Axios configurada em `services/api.js`. Ela centraliza:
- Definição da `baseURL` (ambiente local vs. produção)
- Injeção automática do token JWT em todas as requisições não-públicas
- Tratamento global de erros (`401`, `timeout`, erros de rede)

### Proteção de Rotas
Implementada diretamente em `main.jsx` via componentes wrapper:
- **`ProtectedRoute`**: Redireciona para `/login` se não houver token.
- **`PublicRoute`**: Redireciona para `/home` se o usuário já estiver autenticado (evita acessar login/cadastro com sessão ativa).

### Design System
Sem framework CSS externo (sem Tailwind, sem MUI). Toda a estilização é feita com **Vanilla CSS** por arquivo, seguindo um sistema de design próprio com:
- Tema escuro como padrão (`#0A0A0A`, `#141417`)
- Cor de destaque teal (`#39f0d0`) para elementos interativos
- Tipografia **Inter** (Google Fonts)
- Glassmorfismo em cards e overlays

---

## 📄 Páginas e Funcionalidades

### `/` — Welcome (Pública)
- Tela de entrada do aplicativo.
- Botões de ação para navegar para **Registrar** ou **Entrar**.
- Redireciona automaticamente para `/home` se o usuário já estiver logado.

### `/login` — Login (Pública)
- Formulário com campos de e-mail e senha.
- Exibe/oculta senha com ícone de olho.
- Validação client-side antes de enviar.
- Link ativo para "Esqueci minha senha" (redireciona para `/forgot-password`).
- Armazena o token JWT no `localStorage` após autenticação bem-sucedida.
- Spinner de carregamento no botão durante a requisição.

### `/registration` — Cadastro (Pública)
- Formulário com nome, e-mail, senha e confirmação de senha.
- **Validação robusta:** formato de e-mail, comprimento mínimo, presença de maiúsculas, minúsculas, números e símbolos na senha.
- **Verificação de domínio de e-mail:** consulta os registros MX via DNS do Google para confirmar que o domínio recebe e-mails.
- **Indicador de força de senha** com barra colorida (fraco / médio / forte).
- **Detecção de e-mail já cadastrado:** interpreta o erro `400` do back-end e exibe mensagem amigável e específica.
- Spinner de carregamento no botão durante a requisição.

### `/forgot-password` — Recuperação de Senha (Pública)
- Formulário para inserir o e-mail cadastrado.
- Validação de formato de e-mail antes do envio.
- Chama `POST /api/v1/auth/forgot-password` no back-end.
- Após o envio bem-sucedido, o botão é desabilitado e exibe confirmação, impedindo reenvios acidentais.
- Spinner de carregamento no botão durante a requisição.

### `/home` — Home (🔒 Protegida)
- Exibe saudação personalizada com horário (Bom dia / Boa tarde / Boa noite).
- Carrega **12 músicas** da API ao entrar na tela.
- Exibe **Skeleton Loaders** enquanto as músicas carregam.
- **Barra de pesquisa** com debounce de 300ms: busca músicas na API por título conforme o usuário digita.
- Exibe **Skeleton Loaders** durante a busca.
- Exibe componente `EmptyState` quando nenhum resultado é encontrado.
- Sidebar e bottom navigation para mobile.

### `/preferences` — Preferências (🔒 Protegida)
- Tela de seleção de artistas favoritos.
- Contagem dinâmica de artistas selecionados.

---

## 🧩 Componentes

| Componente | Descrição |
|------------|-----------|
| `Sidebar` | Menu lateral no desktop e barra de navegação inferior no mobile. Contém links de navegação e botão de **Logout** funcional que limpa token e dados de sessão. |
| `Header` | Cabeçalho da Home com saudação dinâmica por horário e botão de configurações. |
| `SearchBar` | Input de pesquisa com ícone. Controlado pelo componente pai. |
| `SongList` | Tabela de músicas com colunas de número, capa, título, artista, álbum e duração. Suporte a linha ativa com indicador de reprodução animado. |
| `SongListSkeleton` | Placeholder animado (shimmer) que espelha o layout do `SongList`. Aceita prop `count` para definir quantas linhas exibir. |
| `FeaturedSection` | Seção de cards de playlists em destaque (atualmente com dados mockados). |
| `EmptyState` | Tela exibida quando uma busca não retorna resultados. |
| `MusicPlayer` | Player de música global, fixado na parte inferior. Aparece nas rotas `/home` e `/preferences`. |
| `ButtonSpinner` | Spinner (bolinha girando) para substituir o texto dos botões durante loading. Aceita props `color` e `size`. |

---

## 🔌 Serviços (API Layer)

### `services/api.js`
Instância central do Axios. Responsável por:
- Determinar a `baseURL` com base na variável `VITE_API_URL`
- **Interceptor de Requisição:** injeta `Authorization: Bearer <token>` em todas as rotas não-públicas
- **Interceptor de Resposta:** padroniza erros, trata `timeout` e, no caso de `401 Unauthorized`, limpa a sessão e redireciona para `/login` automaticamente

### `services/musicService.js`
Funções para os endpoints de música:

| Função | Endpoint | Descrição |
|--------|----------|-----------|
| `getHomeMusics(size)` | `GET /musics?size=12&sort=id,desc` | Busca músicas para a tela inicial |
| `getMusicById(id)` | `GET /musics/{id}` | Busca detalhes completos de uma música |
| `searchMusicsByTitle(title)` | `GET /musics/search/title?title=` | Busca músicas por título |
| `searchMusicsByArtist(artist)` | `GET /musics/search/artist?artist=` | Busca músicas por artista |

---

## 🪝 Hooks Customizados

### `useDebounce(value, delay)`
Atrasa a propagação de um valor por `delay` milissegundos. Usado na barra de pesquisa para evitar uma chamada à API a cada tecla digitada.

```js
const debouncedQuery = useDebounce(rawQuery, 300);
```

### `useMusicSearch(query)`
Orquestra a busca de músicas na API. Recebe a query debounced, sanitiza o input (remove tags HTML e caracteres perigosos), chama `musicService.searchMusicsByTitle()` e retorna os resultados com estados de loading e vazio.

**Retorna:**
```js
{ sanitizedQuery, results, isEmpty, isLoading }
```

---

## 🔐 Segurança

### Autenticação
- Token JWT armazenado em `localStorage` com a chave `@deefy-token`.
- Injetado automaticamente via `Authorization: Bearer` em todas as requisições protegidas.

### Proteção de Rotas
- Rotas privadas (`/home`, `/preferences`) bloqueiam acesso sem token e redirecionam para `/login`.
- Rotas públicas (`/login`, `/registration`) redirecionam usuários autenticados para `/home`.

### Expiração de Sessão (401 Global)
- O interceptor do Axios detecta respostas `401 Unauthorized` em rotas não-públicas.
- Ao detectar, executa `removeToken()` (limpa token e dados de perfil do `localStorage`) e redireciona para `/login` automaticamente.

### Sanitização de Input
- O hook `useMusicSearch` sanitiza a query do usuário antes de enviá-la à API, removendo tags HTML e caracteres potencialmente perigosos.
- A verificação de MX Record no cadastro previne tentativas com domínios de e-mail inexistentes.

### Logout Completo
- O botão de logout na `Sidebar` chama `removeToken()`, que limpa **todos** os dados de sessão do `localStorage` (`@deefy-token` e `@deefy-user`).

---

## 🔗 Integração com o Back-end

A comunicação ocorre com a API REST do back-end (Spring Boot). Todos os endpoints usam o prefixo `/api/v1`.

### Contrato dos Endpoints Utilizados

| Método | Endpoint | Auth | Descrição |
|--------|----------|:----:|-----------|
| `POST` | `/auth/login` | ❌ | Login com `{ email, senha }` |
| `POST` | `/auth/register` | ❌ | Cadastro com `{ nome, email, senha }` |
| `POST` | `/auth/forgot-password` | ❌ | Envia link de reset com `{ email }` |
| `POST` | `/auth/reset-password` | ❌ | Redefine senha com `{ token, novaSenha }` |
| `GET` | `/musics` | ✅ | Lista músicas com paginação |
| `GET` | `/musics/{id}` | ✅ | Detalhe completo de uma música |
| `GET` | `/musics/search/title` | ✅ | Busca por título (`?title=`) |
| `GET` | `/musics/search/artist` | ✅ | Busca por artista (`?artist=`) |
| `GET` | `/users/me` | ✅ | Perfil do usuário autenticado |
| `PATCH` | `/users/me/name` | ✅ | Atualiza nome do usuário |

### Formato das Respostas de Música

```json
// MusicListResponseDTO — usado nas listas (SongList)
{ "id": 1, "title": "Blinding Lights", "artist": "The Weeknd", "coverUrl": "..." }

// MusicDetailResponseDTO — usado no player
{
  "id": 1,
  "title": "Blinding Lights",
  "artist": "The Weeknd",
  "album": "After Hours",
  "genre": "Synthwave",
  "durationSeconds": 200,
  "coverUrl": "https://...",
  "previewUrl": "https://...",
  "dataLancamento": "2020-03-20"
}
```

---

## ⚙️ Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento com Hot Module Replacement (HMR) |
| `npm run build` | Gera o bundle de produção otimizado na pasta `dist/` |
| `npm run preview` | Visualiza o bundle de produção localmente antes do deploy |
| `npm run lint` | Executa o ESLint em todos os arquivos do projeto |
