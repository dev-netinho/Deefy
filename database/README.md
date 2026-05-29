# Banco de dados

Esta pasta contem scripts SQL usados durante o desenvolvimento do Deefy.

Para rodar o projeto localmente em um computador novo, use apenas:

- `scripts/schema_local.sql`
- `scripts/seed_local_demo.sql`

Esses dois arquivos foram preparados para ambiente publico: nao carregam dump
real do Supabase, nao contem segredos e criam um banco PostgreSQL demonstrativo
compativel com o backend atual.

Os demais scripts foram mantidos como historico do projeto academico e podem
estar desatualizados em relacao ao schema final.
