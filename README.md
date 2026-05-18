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
- `db` PostgreSQL
- roteamento HTTPS via Traefik na rede `traefik-public`

Copie `.env.production.example` para `.env` no servidor e ajuste os segredos
antes de subir a stack.
