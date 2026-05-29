# Deefy Front-end

Interface web do Deefy, uma aplicação de streaming musical construída com React, Vite e integração com uma API REST autenticada por JWT.

## Visão Geral

O front-end entrega a experiência completa do usuário final e do administrador:

- autenticação, cadastro, ativação de conta e recuperação de senha;
- home com recomendações, busca inteligente e player global;
- navegação por músicas, artistas, playlists públicas e playlists do usuário;
- favoritos, compartilhamento de música e gerenciamento de playlists;
- edição de perfil, foto de perfil e senha;
- painel administrativo para catálogo musical e usuários.

## Tecnologias

| Categoria | Stack |
| --- | --- |
| UI | React 19, React DOM |
| Build | Vite 8 |
| Rotas | React Router DOM 7 |
| HTTP | Axios |
| Ícones | React Icons |
| Toasts | Sonner |
| Qualidade | ESLint 9 |

## Estrutura

```text
client/
├── public/                 # Assets públicos servidos pelo Vite
├── src/
│   ├── assets/             # Logo e backgrounds usados por telas visuais
│   ├── components/         # Componentes reutilizáveis
│   ├── contexts/           # Estado global do player
│   ├── hooks/              # Hooks de debounce e busca musical
│   ├── pages/              # Telas da aplicação
│   ├── routes/             # Guards e controle do player por rota
│   ├── services/           # Camada de API
│   ├── utils/              # Auth, JWT, normalização, busca e recomendações
│   ├── index.css           # Tokens e estilos globais
│   └── main.jsx            # Entrada da aplicação
├── swagger.json            # Contrato auxiliar da API
├── package.json
└── vite.config.js
```

## Requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- API Deefy disponível localmente ou em produção

## Configuração

Crie um arquivo `.env.local` na pasta `client/`:

```env
VITE_API_URL=http://localhost:8080
VITE_STORAGE_TOKEN_KEY=@deefy-token
```

Notas:

- `VITE_API_URL` é obrigatório. O front normaliza a URL para terminar em `/api/v1` quando necessário.
- `VITE_STORAGE_TOKEN_KEY` define a chave do JWT no `localStorage`.
- Arquivos `.env*` ficam fora do versionamento por segurança.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Rotas

| Rota | Acesso | Descrição |
| --- | --- | --- |
| `/` | Público | Boas-vindas |
| `/login` | Público | Login |
| `/registration` | Público | Cadastro |
| `/forgot-password` | Público | Solicitação de recuperação de senha |
| `/redefinepass` | Público/protegido | Redefinição ou alteração de senha |
| `/verify-account` | Público | Ativação de conta por token |
| `/home` | Protegido | Home, recomendações e busca |
| `/preferences` | Protegido | Preferências musicais por artista |
| `/configuration` | Protegido | Dados e ações de conta |
| `/custom-profile` | Protegido | Edição de nome |
| `/edit-profile` | Protegido | Edição de foto de perfil |
| `/playlists` | Protegido | Favoritos, playlists do usuário e gêneros |
| `/favorites` | Protegido | Músicas favoritas |
| `/system-playlists` | Protegido | Playlists públicas/recomendadas |
| `/artists` | Protegido | Catálogo de artistas |
| `/playlist-detail/:id` | Protegido | Detalhes de playlist pública |
| `/user-playlist-detail/:id` | Protegido | Detalhes de playlist do usuário |
| `/create-playlist` | Protegido | Criação de playlist |
| `/playlist/:id/edit` | Protegido | Edição de playlist |
| `/playlist/:id/add-music` | Protegido | Adição de músicas a uma playlist |
| `/music/:id` | Protegido | Música compartilhada |
| `/admin` | Admin | Gestão de gêneros, artistas, álbuns, músicas e playlists |
| `/admin/users` | Admin | Gestão administrativa de usuários |

## Funcionalidades Principais

### Busca

A busca usa `src/utils/search.js` e `src/hooks/useMusicSearch.js`.

Ela normaliza:

- maiúsculas e minúsculas;
- acentos;
- pontuação e símbolos;
- espaços duplicados ou faltando;
- pequenas diferenças de digitação por token.

Para músicas, o front tenta primeiro buscar no catálogo cacheado (`musicService.searchMusicsSmart`). Se o catálogo não estiver disponível, cai para os endpoints específicos do backend por título, artista, álbum e gênero.

### Player

O player global fica em `PlayerContext` e `MusicPlayer`. Ele mantém fila de reprodução, música atual e progresso local. O `PlayerController` oculta ou mostra o player conforme a rota.

### Playlists e Favoritos

Usuários podem:

- criar e editar playlists;
- adicionar músicas por busca;
- remover músicas de playlists;
- favoritar e desfavoritar músicas;
- compartilhar links de músicas.

### Administração

Rotas administrativas são protegidas por `AdminRoute` no front e devem ser protegidas também no backend. O painel permite:

- criar e listar gêneros;
- cadastrar artistas;
- cadastrar álbuns;
- cadastrar músicas com upload de áudio/capa;
- criar playlists públicas;
- listar, filtrar, editar, banir e excluir usuários.

## Camada de API

### `services/api.js`

Centraliza o Axios:

- monta a `baseURL`;
- injeta `Authorization: Bearer <token>`;
- aplica timeout;
- padroniza erros;
- remove sessão e redireciona para login em `401`.

### `services/musicService.js`

Concentra operações de músicas, playlists, favoritos, artistas e uploads relacionados ao usuário.

### `services/adminService.js`

Concentra operações administrativas de catálogo e usuários.

## Segurança

Medidas aplicadas no front:

- rotas protegidas validam existência e expiração do JWT;
- rotas admin verificam role apenas para UI, mantendo o backend como fonte de autorização real;
- token e role são limpos em logout ou sessão expirada;
- pesquisa sanitiza caracteres perigosos antes de processar texto;
- links externos abertos via `window.open` usam `noopener,noreferrer`;
- uploads validam tipo e tamanho no cliente antes de enviar;
- não há `dangerouslySetInnerHTML`, `eval` ou HTML dinâmico injetado.

Pontos que dependem do backend:

- autorização real de todos os endpoints admin;
- validação de arquivos enviados;
- expiração e revogação de JWT;
- CORS restrito aos domínios oficiais;
- rate limit em login, cadastro, recuperação de senha e uploads.

Observação: o JWT fica em `localStorage`, o que é comum em SPAs acadêmicas, mas não é tão resistente a XSS quanto cookies `HttpOnly` com `SameSite`. Para produção real, essa mudança exigiria contrato com o backend.

## Qualidade e Entrega

Antes de enviar:

```bash
npm run lint
npm run build
```

O build gera a pasta `dist/`, que é artefato local e não deve ser versionado. `node_modules/`, `.env*`, `dist/` e arquivos temporários também ficam fora do versionamento.

## Convenções

- CSS por tela/componente, sem framework visual externo.
- Helpers reutilizáveis ficam em `src/utils`.
- Chamadas HTTP passam por `services`.
- Dados mockados não fazem parte do código final.
- Placeholders visuais não simulam dados reais da API.
