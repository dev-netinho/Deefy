# Auditoria segura do backend na branch staging

Data da auditoria: 2026-05-23

## Objetivo

Este documento registra o que foi alterado no backend Java da `staging`, separando:

- integracoes necessarias para Supabase, Resend, Swagger e frontend;
- adicoes feitas sem substituir codigo existente;
- pontos de risco onde houve alteracao grande em codigo originalmente feito por outros membros;
- itens que nao devem ser revertidos sem quebrar o sistema atual.

Comparacao usada: `ac9c779..HEAD` em `backend/src/main/java`, `backend/src/test/java` e `backend/src/main/resources/application.properties`, depois de sincronizar a branch local com `origin/staging`.

## Estado atual da branch

- A branch local foi sincronizada com `origin/staging` por fast-forward.
- Os commits recentes do Lucas Henrique sobre historico de execucao estao presentes.
- As alteracoes locais de frontend e o export de schema foram guardados em stash antes da auditoria para nao misturar com backend.

## Resumo executivo

O maior risco real estava concentrado no modulo de musicas:

- `Music.java` foi fortemente adaptado para o schema atual do Supabase, trocando a dependencia antiga em `album_id/deezerId` por `artista_id/arquivourl/capaurl`.
- `MusicMapper.java` tinha sido refeito manualmente; nesta auditoria ele foi reduzido de volta para o padrao declarativo do MapStruct, preservando apenas os mapeamentos obrigatorios do schema atual.
- `MusicServiceImpl`, `MusicRepository` e `PlaylistMapper` tiveram alteracoes menores ligadas a essa mesma adaptacao de contrato.

As alteracoes de usuario/perfil, Resend, Swagger e Supabase sao majoritariamente aditivas ou de configuracao. Elas devem ser mantidas, mas estao documentadas porque mexem em arquivos originalmente trabalhados por outros membros.

## Auditoria por area

### Musicas e catalogo

#### `backend/src/main/java/br/com/deefy/model/Music.java`

Autor/base original identificavel:

- Hanrry Santos e Igo tinham contribuicoes anteriores no modulo de musicas.
- O arquivo atual ficou majoritariamente com linhas de `dev-netinho` porque o contrato de banco mudou.

Alteracao feita:

- Removido o uso persistido de `deezerId`.
- Removida a associacao antiga `album_id -> Album`.
- Adicionada associacao `artista_id -> Artist`.
- Adicionados campos persistidos `arquivourl` e `capaurl`.
- `previewUrl` ficou transiente, porque o uso principal passou a ser tocar o arquivo completo por `arquivourl`.
- Adicionados getters auxiliares `getAlbumTitle()` e `getDuration()` para manter compatibilidade com o formato esperado pelo frontend.

Motivo:

- O banco Supabase atual usa `musica.artista_id`, `musica.arquivourl` e `musica.capaurl`.
- O player precisa receber `fileUrl`.
- Se a entidade voltasse para `deezerId/album_id`, o backend quebraria contra o schema atual.

Classificacao:

- `necessaria`, mas `risco medio`.
- Nao deve ser revertida cegamente.
- Ideal tecnico: o time de backend dono do modulo deve revisar e assumir a versao final da entidade.

#### `backend/src/main/java/br/com/deefy/mapper/MusicMapper.java`

Autor/base original identificavel:

- Mapper original era do Hanrry.

Alteracao feita:

- Antes da auditoria, o mapper estava manual.
- Nesta auditoria, ele foi reduzido novamente para MapStruct declarativo.
- Mantidos somente os mapeamentos necessarios:
  - `album <- albumTitle`;
  - `dataLancamento` ignorado;
  - `artist` ignorado na criacao/edicao porque e resolvido no service;
  - `fileUrl` recebe `defaultValue = ""` para respeitar o `NOT NULL` atual.

Motivo:

- Reduzir reescrita desnecessaria.
- Aproximar o arquivo do estilo original do modulo.
- Manter compatibilidade com Supabase e player.

Classificacao:

- `precisava reduzir/reconstruir`.
- Correcao aplicada.

#### `backend/src/main/java/br/com/deefy/service/impl/MusicServiceImpl.java`

Autor/base original identificavel:

- Hanrry.

Alteracao feita:

- Troca de `AlbumRepository` por `ArtistRepository`.
- `createMusic` e `updateMusic` agora validam `artistId`.
- Mantida a estrutura geral do service.

Motivo:

- O schema atual referencia artista direto na musica.
- O frontend/catalogo precisa listar musica por artista.

Classificacao:

- `necessaria`.
- Alteracao pequena em cima da estrutura original.

#### `backend/src/main/java/br/com/deefy/repository/MusicRepository.java`

Autor/base original identificavel:

- Hanrry.

Alteracao feita:

- Query de busca por artista passou de `m.album.artist.nome` para `m.artist.nome`.

Motivo:

- A musica agora aponta direto para artista.

Classificacao:

- `necessaria`.

#### `backend/src/main/java/br/com/deefy/mapper/PlaylistMapper.java`

Autor/base original identificavel:

- Gustavo Coelho.

Alteracao feita:

- Adicionados mapeamentos para `genero`, `duracaoSegundos`, `capaUrl`, `arquivoUrl` e `artista`.
- `album` foi ignorado no DTO de musica dentro da playlist.

Motivo:

- O frontend precisa de URL tocavel e capa ao renderizar faixas de playlist.
- O schema atual nao usa album como centro do catalogo.

Classificacao:

- `necessaria`, alteracao pequena.
- Nao houve reescrita do CRUD de playlist.

### Usuario, perfil e foto

#### `backend/src/main/java/br/com/deefy/model/User.java`

Autor/base original identificavel:

- Arquivo base do projeto, depois integrado com trabalho do Saylon em perfil/autenticacao.

Alteracao feita:

- Adicionado `fotoPerfilUrl` mapeado para a coluna real `fotoperfilurl`.

Motivo:

- O Supabase atual possui essa coluna na tabela `usuario`.
- A tela de perfil precisa mostrar e atualizar foto real.

Classificacao:

- `aditiva`.
- Nao removeu campo existente.

#### `backend/src/main/java/br/com/deefy/controller/UserController.java`

Autor/base original identificavel:

- Saylon trabalhou em perfil/usuario.

Alteracao feita:

- Adicionados endpoints:
  - `PATCH /api/v1/users/me/password`;
  - `PATCH /api/v1/users/me/photo`;
  - `POST /api/v1/users/me/photo/upload`;
  - `DELETE /api/v1/users/me/photo`.
- Adicionadas anotacoes Swagger.

Motivo:

- Permitir troca de senha autenticada.
- Permitir que o usuario envie/remova foto de perfil usando Storage.

Classificacao:

- `aditiva`, mas `risco medio` por volume de linhas no controller.
- Recomenda-se revisao do Saylon para ele validar o fluxo.

#### `backend/src/main/java/br/com/deefy/service/impl/UserServiceImpl.java`

Autor/base original identificavel:

- Saylon.

Alteracao feita:

- Adicionada troca de senha com validacao da senha atual.
- Adicionado suporte a salvar URL de foto.
- Adicionado upload de foto via `ProfilePhotoStorageService`.

Motivo:

- Completar telas de configuracao/perfil.
- Usar a coluna real `fotoperfilurl`.

Classificacao:

- `aditiva`, mas `risco medio` por dividir bastante autoria com o codigo do Saylon.
- Deve ser revisado por quem ficou responsavel por usuario/perfil.

### Resend, JWT e autenticacao

#### `backend/src/main/java/br/com/deefy/service/impl/EmailServiceImpl.java`

Autor/base original identificavel:

- Saylon.

Alteracao feita:

- `resend.api.key`, remetente e URL base do frontend passaram a ter fallback por propriedade.
- Links de ativacao e reset passaram a usar `app.frontend.base-url`.
- Token passou por `URLEncoder` ao montar link.

Motivo:

- Evitar segredo hardcoded.
- Permitir local, VPS e deploy com URLs corretas.
- Corrigir links de e-mail em producao.

Classificacao:

- `necessaria`.
- Alteracao pequena e de integracao.

#### `backend/src/main/java/br/com/deefy/security/JwtUtil.java`

Autor/base original identificavel:

- Saylon.

Alteracao feita:

- `jwt.password.reset.expiration` ganhou fallback.

Motivo:

- Evitar falha de boot quando a variavel nao estiver presente em ambiente local.

Classificacao:

- `necessaria`.

#### `backend/src/main/java/br/com/deefy/controller/AuthController.java`

Autor/base original identificavel:

- Saylon.

Alteracao feita:

- Adicionadas anotacoes Swagger.
- Nao houve mudanca relevante de regra de login/cadastro/reset/ativacao.

Motivo:

- Documentar API no Swagger.

Classificacao:

- `aditiva`.

### Swagger e seguranca

#### `backend/src/main/java/br/com/deefy/config/OpenApiConfig.java`

Alteracao feita:

- Arquivo novo de configuracao OpenAPI/Swagger com Bearer JWT.

Motivo:

- Card de documentacao da API.
- Permitir que backend/frontend testem endpoints pelo Swagger usando token.

Classificacao:

- `aditiva`.

#### `backend/src/main/java/br/com/deefy/config/SecurityConfig.java`

Autor/base original identificavel:

- Gustavo, Igo e Saylon tinham historico no arquivo.

Alteracao feita:

- Swagger liberado publicamente.
- CORS passou a aceitar `PATCH`.

Motivo:

- Swagger precisa abrir sem JWT.
- Perfil/foto/senha usam `PATCH`.

Classificacao:

- `necessaria`.

### Favoritos

Arquivos principais:

- `FavoriteController.java`;
- `FavoriteService.java`;
- `FavoriteServiceImpl.java`;
- entidades/repositories/DTOs de `Favorite`, `FavoriteArtist`, `FavoriteGenre` e `Genre`.

Autor/base identificavel:

- Commit atual esta assinado por Israel.

Alteracao feita:

- Novo modulo de favoritos para musicas, artistas e generos.

Motivo:

- Atender card de favoritos.

Classificacao:

- `aditiva`, sob responsabilidade do commit do Israel.
- Observacao tecnica: deve ser validado contra as tabelas reais `favorito`, `favorito_artista`, `favorito_genero` e `genero` no Supabase.

### Historico de execucao

Arquivos principais:

- `ListeningHistoryController.java`;
- `ListeningHistoryRequest.java`;
- `ListeningHistoryRepository.java`;
- `ListeningHistoryService.java`;
- `AuthenticatedUserService.java`;
- `ListeningHistoryServiceImpl.java`.

Autor/base identificavel:

- Lucas Henrique.

Alteracao feita:

- Endpoints e service de historico foram incorporados de `origin/staging`.

Motivo:

- Manter a branch local alinhada com o GitHub e nao apagar trabalho recente.

Classificacao:

- `codigo do time`.
- Nao foi alterado nesta auditoria.

## Correcoes aplicadas nesta auditoria

### Reducao do `MusicMapper`

Antes:

- Mapper manual com varios metodos `default`.
- Isso aumentava a sensacao de reescrita do modulo do Hanrry.

Depois:

- Mapper voltou ao padrao MapStruct declarativo.
- Foram mantidas apenas anotacoes de mapeamento necessarias para o schema atual.

Impacto esperado:

- Mesmo contrato de API.
- Menos codigo nosso dentro do mapper.
- Menor risco social e tecnico sobre autoria do modulo.

## O que nao foi revertido e por que

### `Music.java`

Nao foi revertido porque o schema Supabase atual nao comporta a entidade antiga baseada em `deezerId` e `album_id`.

Se voltasse ao modelo antigo:

- o backend quebraria contra a tabela `musica`;
- o player perderia `fileUrl`;
- catalogo por artista deixaria de funcionar.

Recomendacao:

- O time dono de musicas deve revisar e assumir oficialmente a entidade alinhada ao schema atual.

### Usuario/perfil

Nao foi revertido porque:

- `fotoperfilurl` existe no banco;
- as adicoes nao removem os endpoints existentes;
- as telas de perfil precisam desses endpoints.

Recomendacao:

- Saylon deve revisar o fluxo de senha/foto para confirmar que ficou consistente com o card dele.

## Riscos restantes

- `Music.java` continua sendo o arquivo mais sensivel por ter mudado o eixo do modelo de album para artista.
- O schema atual ainda tem decisoes de produto em aberto: album foi substituido por genero, mas o frontend ainda pode esperar conceito de album em alguns lugares.
- Favoritos de artista/genero dependem das tabelas reais e constraints do Supabase estarem exatamente como o backend espera.
- Se alguem rodar banco local antigo, endpoints de musica podem falhar por falta de `arquivourl`, `artista_id` ou `fotoperfilurl`.

## Resumo para o time

As alteracoes do backend nao devem ser explicadas como reescrita do trabalho de alguem. O ponto correto e:

- houve uma adaptacao tecnica para o schema Supabase atual;
- o maior impacto foi no modulo de musicas, porque o banco mudou de `album/deezerId` para `artista/arquivoUrl`;
- o mapper de musicas foi reduzido para ficar mais proximo do padrao original;
- perfil/foto/senha, Resend, Swagger e CORS sao adicoes ou configuracoes necessarias;
- historico e favoritos devem continuar sendo tratados como entregas dos respectivos responsaveis nos commits atuais.
