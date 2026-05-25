# Revisao dos commits do backend por area/autoria

Data: 2026-05-23

## Objetivo

Verificar se as alteracoes feitas depois da integracao da `staging` substituíram codigo importante entregue pelos membros do backend ou se foram apenas ajustes de integracao com Supabase, Resend, Swagger, perfil e player.

Base revisada:

- Branch local sincronizada com `origin/staging`.
- Comparacao principal: alteracoes posteriores aos merges dos cards de musica/perfil/front, especialmente `ac9c779..HEAD`.
- Testes executados: `./mvnw test` no backend, com sucesso.

## Resultado geral

Nao encontrei substituicao grave distribuida pelo backend inteiro.

O ponto mais sensivel e real esta no modulo de musicas:

- `Music.java` foi fortemente adaptado para o schema Supabase atual.
- `MusicMapper.java` tinha sido reescrito manualmente e foi reduzido novamente para MapStruct declarativo.

Nos demais modulos, as alteracoes foram majoritariamente:

- anotacoes Swagger;
- configuracao CORS/Resend/Supabase;
- endpoints novos de perfil/foto/senha;
- ajustes pequenos para devolver `arquivoUrl`, `capaUrl` e artista ao frontend.

## Revisao por responsavel

### Hanrry / Igo - Musicas

Arquivos originais envolvidos:

- `MusicController.java`
- `MusicRequestDTO.java`
- `MusicDetailResponseDTO.java`
- `MusicListResponseDTO.java`
- `MusicMapper.java`
- `Music.java`
- `MusicRepository.java`
- `MusicService.java`
- `MusicServiceImpl.java`
- testes de musicas

O que foi alterado por nos:

- `Music.java`: mudanca grande para sair de `deezerId` e `album_id`, passando a usar `artista_id`, `arquivourl` e `capaurl`.
- `MusicMapper.java`: inicialmente refeito manualmente; corrigido nesta revisao para voltar ao estilo declarativo do MapStruct.
- `MusicServiceImpl.java`: troca de `AlbumRepository` por `ArtistRepository`.
- `MusicRepository.java`: busca por artista passou a usar `m.artist.nome`.
- DTOs de resposta passaram a incluir `fileUrl`, `duration`, `previewUrl` e campos que o player/frontend usam.

Classificacao:

- `Music.java`: necessario para Supabase, mas risco medio por ter alterado muito a base original.
- `MusicMapper.java`: era risco medio; foi reduzido nesta revisao.
- Services/repositories/DTOs: necessarios para alinhar schema e player.

Conclusao:

- Aqui foi onde chegamos mais perto de substituir estrutura dos colegas.
- A justificativa tecnica existe: o schema atual nao usa mais o modelo antigo centrado em `album/deezerId`.
- Ainda assim, o modulo deve ser revisado pelo responsavel de musicas para ele assumir a versao final.

### Gustavo - Playlists

Arquivos principais revisados:

- `PlaylistController.java`
- `PlaylistService.java`
- `PlaylistServiceImpl.java`
- `PlaylistRepository.java`
- `PlaylistMapper.java`

O que foi alterado por nos:

- `PlaylistController.java`: somente anotacoes Swagger/OpenAPI.
- `PlaylistMapper.java`: mapeamentos extras para devolver dados da musica no formato atual (`arquivoUrl`, `capaUrl`, artista, duracao).

O que nao foi substituido:

- `PlaylistServiceImpl.java` nao foi refeito.
- CRUD e regras principais de playlist continuam sendo o codigo recebido do Gustavo.

Classificacao:

- Baixo risco.
- Alteracao pequena e de integracao.

Observacao:

- Existe um ponto tecnico no proprio controller: algumas rotas usam `@AuthenticationPrincipal Object` e uma usa `@AuthenticationPrincipal User`. Isso deve ser revisado futuramente por consistencia, mas nao foi uma substituicao nossa do service.

### Lucas Henrique - Historico

Arquivos principais revisados:

- `ListeningHistoryController.java`
- `ListeningHistoryRequest.java`
- `ListeningHistoryRepository.java`
- `ListeningHistoryService.java`
- `AuthenticatedUserService.java`
- `ListeningHistoryServiceImpl.java`

O que foi alterado por nos:

- Nada relevante nesta revisao.
- A branch local estava atrasada e foi sincronizada com `origin/staging`, trazendo os commits recentes do Lucas por fast-forward.

O que foi preservado:

- Controller de historico.
- Service paginado.
- Uso do usuario autenticado via `AuthenticatedUserService`.

Classificacao:

- Sem indicio de substituicao por nossa parte.

### Saylon - Auth, usuario, perfil, Resend

Arquivos principais revisados:

- `AuthController.java`
- `UserController.java`
- `UserService.java`
- `UserServiceImpl.java`
- `EmailServiceImpl.java`
- `JwtUtil.java`
- `SecurityConfig.java`
- `User.java`
- `UserResponseDTO.java`

O que foi alterado por nos:

- `AuthController.java`: anotacoes Swagger.
- `EmailServiceImpl.java`: links passaram a usar `app.frontend.base-url`; token passa por encode; valores sensiveis ficam por variaveis.
- `JwtUtil.java`: fallback para expiracao do token de reset.
- `UserController.java` e `UserServiceImpl.java`: adicionados endpoints/metodos de troca de senha e foto de perfil.
- `User.java`: adicionado `fotoPerfilUrl` mapeando coluna real `fotoperfilurl`.
- `UserResponseDTO.java`: adicionado `fotoPerfilUrl`.

O que nao foi substituido:

- Fluxo de cadastro, ativacao, login e reset continuou com a estrutura do Saylon.
- Resend continuou sendo usado.
- Nao foi removida a logica principal de autenticacao.

Classificacao:

- Auth/Resend/JWT: baixo risco, integracao necessaria.
- Usuario/perfil/foto: risco medio por volume de linhas adicionadas em arquivos do Saylon, mas sem evidencia de remocao da regra original.

Conclusao:

- Deve ser revisado pelo Saylon por ser a area dele, mas o que entrou foi aditivo.

### Israel - Favoritos

Arquivos principais revisados:

- `FavoriteController.java`
- `FavoriteService.java`
- `FavoriteServiceImpl.java`
- entidades/repositories/DTOs de favoritos
- `Genre.java`
- `GenreRepository.java`

O que foi alterado por nos:

- Nao houve alteracao posterior relevante nesses arquivos durante esta revisao.

Classificacao:

- Codigo novo assinado pelo Israel.
- Precisa apenas validar contra o schema real do Supabase (`favorito`, `favorito_artista`, `favorito_genero`, `genero`).

Conclusao:

- Nao tratar como codigo nosso.
- Se houver erro, alinhar com Israel e banco.

### Configuracao geral / Swagger

Arquivos envolvidos:

- `OpenApiConfig.java`
- `SecurityConfig.java`
- `application.properties`
- anotacoes em controllers

O que foi alterado:

- Swagger com Bearer JWT.
- CORS com `PATCH`.
- Propriedades para Supabase, Resend, frontend base URL e upload de foto.

Classificacao:

- Necessario para integracao e testes.
- Baixo risco funcional.

## Pontos de atencao reais

1. `Music.java` continua sendo o maior ponto sensivel.

Motivo:

- Foi necessario adaptar ao schema atual, mas isso mudou bastante a estrutura que vinha do modulo de musicas.

Acao recomendada:

- Hanrry/Igo devem revisar e confirmar a entidade final.

2. `MusicMapper.java` foi corrigido nesta revisao.

Motivo:

- Ele tinha sido refeito manualmente.

Acao tomada:

- Voltou para MapStruct declarativo, reduzindo codigo nosso.

3. Usuario/perfil precisa de revisao do Saylon.

Motivo:

- As adicoes de foto/senha sao corretas para o produto, mas entraram em arquivos dele.

Acao recomendada:

- Saylon validar endpoints de perfil/foto/senha.

4. Playlist nao foi sobrescrita.

Motivo:

- Service/CRUD continuam do Gustavo.
- Alteramos so documentacao e mapper de resposta.

5. Historico nao foi sobrescrito.

Motivo:

- Commits do Lucas foram preservados ao sincronizar com `origin/staging`.

## Conclusao final

Nao parece que destruimos o backend inteiro nem substituimos todos os cards dos colegas.

O problema real foi concentrado no modulo de musicas, porque a adaptacao ao schema Supabase exigiu trocar o eixo antigo `album/deezerId` por `artista/arquivoUrl`. Isso era tecnicamente necessario para o player e o catalogo funcionarem, mas deve ser tratado com cuidado e revisado pelo dono do modulo.

O restante das alteracoes e majoritariamente integracao, documentacao ou adicao de endpoint, nao reescrita do trabalho dos outros.
