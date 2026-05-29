# Deefy

Deefy e uma plataforma academica de streaming musical desenvolvida com
frontend React/Vite, backend Java/Spring Boot, PostgreSQL e uma stack de deploy
containerizada.

O projeto nasceu como uma aplicacao local e evoluiu para uma arquitetura web com
API REST, autenticacao JWT, painel administrativo, player de musica, playlists,
favoritos, importacao administrativa de playlists do YouTube e documentacao
navegavel com Swagger/OpenAPI.

## Principais funcionalidades

- Cadastro, verificacao de conta, login JWT e recuperacao de senha.
- Perfil do usuario com edicao de nome, senha e foto.
- Catalogo de musicas com busca por titulo, artista, genero e album visual.
- Player com fila, play/pause, avancar, voltar, repeticao, aleatorio e volume.
- Favoritos de musicas, artistas e generos.
- Playlists pessoais com criacao, edicao, capa, descricao e faixas.
- Playlists globais publicas para descoberta de conteudo.
- Painel admin para artistas, generos, musicas, playlists, usuarios e uploads.
- Importacao de playlist do YouTube usando `yt-dlp`, `ffmpeg` e storage externo.
- Swagger/OpenAPI para testar e documentar a API.

## Estrutura

```text
backend/                 API Spring Boot
frontend/                Aplicacao React/Vite
database/scripts/        SQL local e scripts historicos do banco
docs/                    Documentacao, estudos e materiais de apresentacao
tools/                   Scripts operacionais auxiliares
docker-compose.local.yml Ambiente local completo com PostgreSQL demo
docker-compose.prod.yml  Stack de producao com Traefik
```

## Rodando localmente

O modo local foi preparado para repositorio publico. Ele nao depende do Supabase,
nao usa credenciais reais e sobe um PostgreSQL local com dados demonstrativos.

Requisitos:

- Docker Compose ou Podman Compose.
- Porta `5173` livre para o frontend.
- Porta `8080` livre para o backend.
- Porta `5433` livre para o PostgreSQL local.

Suba tudo com:

```bash
docker compose -f docker-compose.local.yml up -d --build
```

Depois de subir:

- Frontend: `http://localhost:5173`
- Backend/API: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- PostgreSQL: `localhost:5433`

Credenciais demo:

- Usuario comum: `demo@deefy.local`
- Admin: `deefy.admin@deefy.com`
- Senha dos dois usuarios: `deefy123`

Para recriar o banco local do zero:

```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d --build
```

## Banco de dados local e Supabase

O banco mais atualizado do projeto original foi mantido em ambiente Supabase.
Para tornar o repositorio publico, o projeto inclui uma versao local segura:

- `database/scripts/schema_local.sql`: estrutura PostgreSQL compatível com o
  backend atual.
- `database/scripts/seed_local_demo.sql`: dados demonstrativos minimos para
  login, catalogo, playlists e player.

Por seguranca e privacidade, o repositorio nao inclui dump completo do Supabase,
usuarios reais, senhas, tokens, cookies, service role keys nem arquivos reais do
Supabase Storage. As musicas e imagens do seed local usam URLs publicas de
exemplo apenas para permitir demonstracao funcional.

Na pratica:

- Para desenvolvimento e avaliacao publica, use `docker-compose.local.yml`.
- Para producao, configure seu proprio PostgreSQL/Supabase e preencha as
  variaveis de ambiente a partir de `.env.production.example`.
- Se quiser usar storage real, configure buckets e chaves proprias fora do Git.

## Variaveis de ambiente

Arquivos `.env` reais nao devem ser versionados.

Use:

- `.env.example` como referencia para desenvolvimento local manual.
- `.env.production.example` como referencia para deploy.
- `secrets/` para arquivos operacionais sensiveis, como cookies do YouTube.

O `.gitignore` bloqueia `.env*`, exceto os exemplos versionados.

## Documentacao da API

A API possui Swagger/OpenAPI.

- Swagger UI local: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON local: `http://localhost:8080/v3/api-docs`
- Em producao: `https://seu-dominio.com/swagger-ui.html`

Para testar endpoints protegidos:

1. Abra o Swagger UI.
2. Execute `POST /api/v1/auth/login`.
3. Copie o campo `token` retornado.
4. Clique em `Authorize`.
5. Informe `Bearer <token>`.
6. Teste os endpoints protegidos.

## Deploy

O deploy de producao usa `docker-compose.prod.yml` com:

- Backend Spring Boot.
- Frontend React servido por Nginx.
- PostgreSQL/Supabase configurado por variaveis de ambiente.
- Traefik como proxy reverso HTTPS.
- Volume `secrets/` para segredos operacionais fora do Git.

Antes de subir em producao:

```bash
cp .env.production.example .env
```

Depois, edite `.env` com valores reais do seu ambiente.

## Ressalvas profissionais

Este repositorio foi preparado para ser publico e executavel localmente, mas
algumas integracoes dependem de servicos externos:

- Envio real de e-mail exige `RESEND_API_KEY`.
- Upload real de imagens/audios exige storage externo configurado.
- Importacao do YouTube depende de `yt-dlp`, `ffmpeg`, cookies validos quando o
  YouTube solicitar verificacao e credenciais de storage.
- O seed local e demonstrativo; ele nao representa o catalogo completo usado no
  ambiente original.

Essas limitacoes sao intencionais para manter o projeto seguro, reproduzivel e
adequado para publicacao open source.

## Contribuidores

- [Jose G. C. Neto](https://github.com/dev-netinho)

Se voce tambem participou do projeto, adicione seu nome e perfil GitHub nesta
secao.

## Licenca

Distribuido sob a licenca MIT. Veja `LICENSE`.
