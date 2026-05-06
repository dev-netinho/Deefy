## Banco de dados do Deefy

Scripts do banco PostgreSQL usados pelo backend Spring Boot.

### Como criar o banco local

1. Crie um banco PostgreSQL. O nome usado pelo backend hoje e `deefy`.
2. Execute `scripts/schema.sql`.
3. Execute `scripts/insert.sql` para carregar dados iniciais.
4. Suba o backend apontando para esse banco. O backend usa
   `spring.jpa.hibernate.ddl-auto=validate`, entao ele valida o schema em vez de
   criar ou alterar tabelas automaticamente.

Configuracao padrao do backend:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/deefy
spring.datasource.username=postgres
spring.datasource.password=1234
```

Se seu banco tiver outro nome, usuario ou senha, altere essas tres propriedades
em `backend/src/main/resources/application.properties` ou sobrescreva por
variaveis de ambiente.

### Observacao de integracao

O backend agora usa a tabela `usuario` do script do banco, em vez de criar uma
tabela paralela `tb_usuario`. Os usuarios de `scripts/insert.sql` ja usam senha
BCrypt e conseguem autenticar:

- `vitoria@uepa.br` / `senha123`
- `joao@email.com` / `user123`

O script `scripts/seed.sql` e opcional e adiciona mais usuarios/musicas para
desenvolvimento.
