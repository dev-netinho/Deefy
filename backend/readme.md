## Backend do Deefy

Backend Spring Boot integrado ao banco PostgreSQL definido em
`../database/scripts/schema.sql`.

### Rodando localmente

1. Crie o banco `deefy` no PostgreSQL.
2. Execute `../database/scripts/schema.sql`.
3. Execute `../database/scripts/insert.sql`.
4. Suba a API:

```bash
./mvnw spring-boot:run
```

Configuracao padrao:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/deefy
spring.datasource.username=postgres
spring.datasource.password=1234
spring.jpa.hibernate.ddl-auto=validate
```

Se usuario, senha ou nome do banco forem diferentes, ajuste
`src/main/resources/application.properties` ou sobrescreva com variaveis de
ambiente.

### Endpoints atuais

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `PUT /api/v1/users/{id}`
- `DELETE /api/v1/users/{id}`
