## Backend do Deefy

Backend Spring Boot integrado ao PostgreSQL definido em
`../database/scripts/schema_local.sql` para ambiente local.

### Rodando localmente

1. Suba o PostgreSQL local usando o `docker-compose.local.yml` da raiz ou crie
   um banco `deefy` manualmente.
2. Execute `../database/scripts/schema_local.sql`.
3. Execute `../database/scripts/seed_local_demo.sql`.
4. Exporte as variáveis de ambiente e suba a API:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/deefy
export SPRING_DATASOURCE_USERNAME=deefy
export SPRING_DATASOURCE_PASSWORD=deefy
export JWT_SECRET=local-dev-secret-change-me-local-dev-secret
./mvnw spring-boot:run
```

Configuracao padrao:

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/deefy
SPRING_DATASOURCE_USERNAME=deefy
SPRING_DATASOURCE_PASSWORD=deefy
JWT_SECRET=local-dev-secret-change-me-local-dev-secret
```

Se usuário, senha, porta ou nome do banco forem diferentes, sobrescreva por
variáveis de ambiente. O arquivo `application.properties` não guarda senha real.

### Endpoints atuais

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `PUT /api/v1/users/{id}`
- `DELETE /api/v1/users/{id}`
