## Deefy, o recomeço
José G. C. Neto
Hanrry
Lucas Henrique
Igo Roberth
Saylon
Lucas Daniel
Mauricio
Gustavo
Israel

## Estrutura

- `frontend`: aplicacao React/Vite
- `backend`: API Spring Boot
- `database`: schema e scripts PostgreSQL

## Producao

O projeto possui uma stack pronta para deploy com Docker Compose em
`docker-compose.prod.yml`, usando:

- `frontend` servido por Nginx
- `backend` Spring Boot
- banco PostgreSQL/Supabase via variaveis de ambiente
- roteamento HTTPS via Traefik na rede `traefik-public`

Copie `.env.production.example` para `.env` no servidor e ajuste os segredos
antes de subir a stack.

## Documentacao da API

A API possui documentacao navegavel com Swagger/OpenAPI.

- Swagger UI em producao/staging: `https://deefy.olua.me/swagger-ui.html`
- OpenAPI JSON em producao/staging: `https://deefy.olua.me/v3/api-docs`
- Swagger UI local: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON local: `http://localhost:8080/v3/api-docs`

### Como testar endpoints protegidos

1. Abra o Swagger UI.
2. Execute `POST /api/v1/auth/login` com e-mail e senha validos.
3. Copie o campo `token` retornado.
4. Clique em `Authorize`.
5. Informe o valor no formato `Bearer <token>`.
6. Teste endpoints protegidos de User/Profile, Music e Playlist.

### Modulos documentados

- Auth: login, cadastro, ativacao de conta e recuperacao de senha.
- User/Profile: consulta de usuario, perfil autenticado e atualizacao de nome.
- Music: listagem, busca, criacao, atualizacao e remocao de musicas.
- Playlist: CRUD de playlists do usuario e inclusao/remocao de musicas.

### Pendencias de API

Os itens abaixo aparecem no planejamento do projeto, mas ainda nao possuem
controller publico na branch `staging`; por isso nao aparecem como endpoints
testaveis no Swagger:

- Favorites/Favoritos
- Rating/Avaliacao
- History/Historico

Quando esses controllers forem implementados, eles devem receber `@Tag`,
`@Operation` e, se forem protegidos por JWT, `@SecurityRequirement`.
