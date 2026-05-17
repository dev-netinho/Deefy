# Relatorio para alinhamento com o time de banco de dados

## Mensagem pronta para enviar

Pessoal, para backend e banco conversarem no mesmo idioma, vamos tratar `database/scripts/schema_atualizado.sql` como o contrato oficial atual. O backend nao vai inventar tabela nem alterar o SQL de voces por conta propria. Quando faltar algo, a gente vai reportar aqui para o time de BD decidir e versionar.

Pontos que precisamos alinhar:

1. A tabela `USUARIO` hoje tem `id`, `nome`, `email`, `senha` e `perfil_id`. O backend antigo ainda tinha campos Java `createdAt` e `tipo_usuario`, mas essas colunas nao existem no schema oficial. Temporariamente esses campos foram marcados como nao persistidos no Java. Precisamos decidir: `createdAt` deve existir no banco ou deve sair dos DTOs? E permissao deve ser resolvida por `PERFIL`/`ADMINISTRADOR` ou por uma coluna de tipo?

2. O schema usa nomes mistos como `dataHoraExecucao`, `dataCriacao`, `capaUrl`, `arquivoUrl`. No PostgreSQL, quando o nome nao esta entre aspas, ele vira minusculo internamente. Exemplo: `dataHoraExecucao` vira `datahoraexecucao`. Para evitar bugs de mapeamento, precisamos padronizar a convencao: ou tudo `snake_case`, ou tudo minusculo, ou nomes com aspas. A recomendacao tecnica e `snake_case`.

3. O modelo oficial de midia fica assim: PostgreSQL guarda metadados e URLs; MinIO guarda arquivos. Entao `MUSICA.arquivoUrl`, `MUSICA.previewUrl`, `MUSICA.capaUrl`, `ALBUM.capaUrl` e `ARTISTA.fotoUrl` sao as colunas que o backend/frontend vao consumir. Nao vamos salvar binario de musica/imagem no PostgreSQL.

4. A entidade Java `Music` da `staging` ainda tem campo antigo `deezerId`, mas o schema oficial atual nao tem mais essa coluna e exige `arquivoUrl`. O backend precisa ser ajustado oficialmente para remover dependencia de Deezer e usar `arquivoUrl` como URL principal da musica.

5. A tabela `PLAYLIST_MUSICA` tem chave primaria composta por `(playlist_id, musica_id)` e tambem tem `ordem`. Isso impede a mesma musica de aparecer duas vezes na mesma playlist e deixa a ordenacao dependente de uma coluna extra. Precisamos confirmar se essa regra e intencional. Se a playlist precisar aceitar repeticao ou ordenacao mais flexivel, talvez seja melhor uma tabela associativa com `id` proprio.

6. O backend possui um modelo Java `MusicRating`, mas o schema oficial nao tem tabela `AVALIACAO`. Se avaliacao/nota fizer parte do projeto, precisamos que o BD crie a tabela oficial. Se nao fizer parte, o backend deve remover/deixar esse modulo fora da API.

7. A tabela `ADMINISTRADOR` existe no schema, mas o backend ainda nao tem entidade/service/controller dedicados para administracao. Precisamos confirmar a regra: admin e usuario com registro em `ADMINISTRADOR`? Admin tambem tem `PERFIL`? Como o backend deve validar quem pode acessar painel/admin?

8. `HISTORICO_EXECUCAO` tem `tempoOuvido`, mas o backend oficial ainda nao expoe controller de historico. Precisamos confirmar se `tempoOuvido` e obrigatorio nas regras de negocio e se ele representa segundos, milissegundos ou percentual.

9. Para seeds de usuarios, se o backend usa Spring Security com BCrypt, a coluna `senha` precisa receber hash BCrypt, nao senha pura. Caso contrario, os usuarios inseridos por seed nao conseguem logar.

10. Para MinIO, precisamos que o contrato do BD aceite URLs publicas ou URLs assinadas. Hoje o caminho documentado foi URL publica no formato `http://IP_OU_SERVIDOR:9000/musicas/NOME_DO_ARQUIVO.mp3`. Em producao, o ideal e padronizar uma base URL estavel e nao depender de IP local.

## Tabela faltante reportada: `AVALIACAO`

Status atual:

- Existe modelo Java `MusicRating`.
- Nao existe tabela `AVALIACAO` no `schema_atualizado.sql`.
- Nao devemos criar essa tabela no backend sem aprovacao do time de BD.

Se o produto realmente precisar de avaliacao de musicas, sugestao para o time de BD:

```sql
CREATE TABLE AVALIACAO
(
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    musica_id INT NOT NULL,
    nota INT NOT NULL,
    comentario TEXT,
    dataAvaliacao TIMESTAMP NOT NULL,

    CONSTRAINT fk_avaliacao_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES USUARIO(id),

    CONSTRAINT fk_avaliacao_musica
        FOREIGN KEY (musica_id)
        REFERENCES MUSICA(id),

    CONSTRAINT uk_avaliacao_usuario_musica
        UNIQUE (usuario_id, musica_id),

    CONSTRAINT ck_avaliacao_nota
        CHECK (nota >= 1 AND nota <= 5)
);
```

Modulo Java esperado se a tabela for aprovada:

- Entity: `MusicRating`
- Repository: `MusicRatingRepository`
- Service: `MusicRatingService`
- DTOs: `MusicRatingRequestDTO`, `MusicRatingResponseDTO`
- Controller: `MusicRatingController`
- Endpoints esperados:
  - `POST /api/v1/musics/{musicId}/ratings`
  - `GET /api/v1/musics/{musicId}/ratings`
  - `GET /api/v1/users/{userId}/ratings`
  - `PUT /api/v1/ratings/{id}`
  - `DELETE /api/v1/ratings/{id}`

## Modulos que o schema ja suporta, mas o backend oficial ainda nao expos

### Catalogo musical

Tabelas existentes:

- `ARTISTA`
- `ALBUM`
- `MUSICA`

Backend ainda precisa:

- `ArtistRepository`, `ArtistService`, `ArtistController`
- `AlbumRepository`, `AlbumService`, `AlbumController`
- `MusicRepository`, `MusicService`, `MusicController`
- DTOs de request/response para artista, album e musica
- validacao de URLs MinIO em `fotoUrl`, `capaUrl`, `previewUrl` e `arquivoUrl`
- regra de seguranca para escrita: somente admin/equipe autorizada
- leitura publica/autenticada para o frontend montar home, albuns e player

### Playlist

Tabelas existentes:

- `PLAYLIST`
- `PLAYLIST_MUSICA`

Backend ainda precisa:

- `PlaylistController`
- DTOs de request/response
- associacao real com `UserRepository` e `MusicRepository`
- regra de dono da playlist
- endpoints para adicionar/remover/reordenar musicas
- decisao do BD sobre permitir musica repetida na mesma playlist

### Historico de execucao

Tabela existente:

- `HISTORICO_EXECUCAO`

Backend ainda precisa:

- `ListeningHistoryController`
- DTOs incluindo `tempoOuvido`, se for regra oficial
- endpoints para registrar execucao e consultar historico por usuario
- politica de privacidade: usuario so ve o proprio historico, admin pode auditar conforme regra

### Administracao

Tabela existente:

- `ADMINISTRADOR`

Backend ainda precisa:

- `Administrator` entity ou regra clara usando `User` + `Perfil`
- `AdministratorRepository`
- service para validar permissao
- integracao com Spring Security
- endpoints administrativos protegidos

## Fechamento

O principal alinhamento e: o banco define o contrato, o backend implementa exatamente esse contrato, e qualquer falta vira card formal antes de virar codigo. Isso evita que uma equipe "conserte" silenciosamente o trabalho da outra e depois ninguem saiba qual e a fonte da verdade.
