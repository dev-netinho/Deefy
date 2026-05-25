# Roteiro da apresentacao: Deploy, integracao e otimizacao do Deefy

Este documento sera usado como prototipo vivo do roteiro da apresentacao. A partir deste ponto, toda alteracao tecnica relevante deve ser registrada aqui com: data, arquivos alterados, motivo e impacto.

Data base: 2026-05-24
Projeto: Deefy
Ambiente em producao: `https://deefy.olua.me`
Branch alvo do deploy final: `main`
Branch preservada como reserva: `staging`
Branch de integracao final: `release/main-apresentacao`

## Ideia central da apresentacao

O objetivo da apresentacao e mostrar como o Deefy saiu de um projeto local para uma aplicacao web publicada, com frontend, backend, banco de dados e infraestrutura trabalhando juntos.

A narrativa principal:

1. O projeto foi containerizado com Docker para padronizar execucao.
2. O backend Java/Spring Boot e o frontend React foram empacotados em containers separados.
3. Os containers foram enviados para uma VPS.
4. O Traefik foi usado como proxy reverso para direcionar as requisicoes HTTP/HTTPS para o container correto.
5. O Tailscale foi usado para facilitar o acesso seguro e administravel entre maquinas e infraestrutura.
6. A Cloudflare foi usada para transformar o acesso por IP numerico em dominio amigavel.
7. O backend foi integrado ao banco PostgreSQL/Supabase usando variaveis de ambiente, sem expor credenciais no codigo.
8. O frontend foi integrado ao backend por meio da URL publica da API.
9. Apos o deploy, investigamos lentidao na Home e otimizamos o carregamento de musicas e favoritos sem alterar o schema do banco.

## Abertura sugerida

"O Deefy comecou como uma aplicacao que rodava localmente, mas para aproximar o projeto de um cenario real de producao, fizemos o processo completo de publicacao. Usamos Docker para empacotar frontend e backend, subimos esses containers em uma VPS, usamos Traefik como porta de entrada das requisicoes, conectamos o dominio pela Cloudflare e integramos tudo com o banco PostgreSQL/Supabase. O resultado e uma aplicacao acessivel pela web, com frontend consumindo a API real e backend persistindo dados no banco configurado."

## Parte 1: Docker e containerizacao

Docker foi usado para garantir que a aplicacao rode da mesma forma independentemente da maquina. Em vez de depender de instalacoes manuais de Node, Java, Maven ou Nginx na VPS, cada parte do sistema roda dentro do seu proprio container.

No Deefy, separamos responsabilidades:

- O container do backend roda a API Java/Spring Boot.
- O container do frontend gera o build React e entrega os arquivos estaticos via Nginx.
- O arquivo `docker-compose.prod.yml` organiza como esses containers sobem juntos em producao.

Arquivos envolvidos:

- `docker-compose.prod.yml`: define os servicos de producao, variaveis de ambiente, labels do Traefik e configuracao dos containers.
- `backend/Dockerfile`: empacota o backend Spring Boot em uma imagem Docker executavel.
- `frontend/Dockerfile`: gera o build do frontend e publica os arquivos finais com Nginx.
- `frontend/nginx.conf`: garante que rotas do React funcionem mesmo quando o usuario acessa uma URL interna diretamente.

Ponto importante para explicar:

O frontend React e uma Single Page Application. Isso significa que rotas como `/home`, `/playlists` ou `/configuracoes` nao existem como arquivos fisicos no servidor. Por isso o Nginx precisa devolver `index.html` para essas rotas, deixando o React assumir a navegacao no navegador.

## Parte 2: VPS

A VPS funciona como o servidor onde a aplicacao fica disponivel 24 horas. Depois de gerar as imagens Docker, os containers sao executados nessa maquina.

Na pratica, a VPS substitui o ambiente local. Em vez de rodar `npm run dev` ou `mvn spring-boot:run` no computador do desenvolvedor, o servidor executa os containers em modo de producao.

Pontos para destacar:

- A VPS recebe os arquivos do projeto.
- O Docker Compose faz o build das imagens.
- O Docker sobe os containers de backend e frontend.
- A aplicacao passa a responder pela internet, desde que exista roteamento correto.

## Parte 3: Traefik como proxy reverso

O Traefik fica na frente dos containers. Ele recebe as requisicoes que chegam pelo dominio e decide para qual container enviar.

Exemplo conceitual:

- `https://deefy.olua.me/` vai para o frontend.
- `https://deefy.olua.me/api/v1/...` vai para o backend.
- O Traefik tambem ajuda no roteamento HTTPS e centraliza a entrada da aplicacao.

Por que isso importa:

Sem proxy reverso, seria necessario expor portas internas diretamente, como `8080` para backend ou `80` para frontend. Com Traefik, o usuario acessa tudo por um dominio limpo, e a infraestrutura decide internamente qual container responde.

## Parte 4: Tailscale

O Tailscale foi usado como camada de acesso seguro entre maquinas. Ele cria uma rede privada entre dispositivos autorizados, facilitando administracao e conexao com a VPS sem depender apenas de exposicao publica direta.

Na apresentacao, a explicacao pode ser:

"O Tailscale ajudou a tratar a VPS como parte de uma rede privada controlada. Isso facilita acesso administrativo e reduz a dependencia de abrir servicos internos diretamente para toda a internet."

## Parte 5: Cloudflare e dominio

Depois que a aplicacao estava rodando na VPS, a Cloudflare foi usada para configurar o dominio publico.

Antes:

- O acesso dependeria do IP numerico da VPS.
- IPs sao dificeis de memorizar e pouco amigaveis.

Depois:

- O acesso passou a ser feito por `https://deefy.olua.me`.
- O dominio aponta para a infraestrutura correta.
- A URL fica mais simples, profissional e proxima do conceito de WWW.

Explicacao simples:

"A Cloudflare fez a ponte entre o nome do site e o endereco real do servidor. O usuario digita o dominio, a Cloudflare resolve esse dominio para a infraestrutura da VPS, e o Traefik direciona a requisicao para o container correto."

## Parte 6: Integracao do backend com o banco de dados

O backend foi integrado ao banco PostgreSQL/Supabase por configuracao, nao por credenciais fixas no codigo.

No Spring Boot, a conexao fica centralizada em:

- `backend/src/main/resources/application.properties`

Campos importantes:

- `spring.datasource.url=${SPRING_DATASOURCE_URL:...}`
- `spring.datasource.username=${SPRING_DATASOURCE_USERNAME:...}`
- `spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:...}`
- `spring.jpa.hibernate.ddl-auto=none`

O que isso significa:

- A URL real do banco vem da variavel `SPRING_DATASOURCE_URL`.
- O usuario do banco vem de `SPRING_DATASOURCE_USERNAME`.
- A senha vem de `SPRING_DATASOURCE_PASSWORD`.
- As credenciais nao ficam escritas no codigo fonte.
- `ddl-auto=none` impede o Hibernate de alterar automaticamente o schema do banco.

Ponto essencial para apresentar:

"A integracao com o banco foi feita mantendo seguranca e controle. O backend conhece o banco por variaveis de ambiente configuradas no deploy, e nao por valores hardcoded. Tambem deixamos `ddl-auto=none`, entao a aplicacao nao cria, altera ou remove tabelas automaticamente em producao."

Sobre Supabase:

O Supabase fornece o PostgreSQL usado pelo backend. A aplicacao acessa esse banco pela connection string configurada no ambiente da VPS. Alem disso, para arquivos como imagens e musicas, o projeto tambem pode usar buckets de storage configurados por variaveis como:

- `SUPABASE_PROJECT_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_IMAGE_BUCKET`
- `SUPABASE_STORAGE_MUSIC_BUCKET`

Importante:

Essas chaves sao segredos de infraestrutura e nao devem ser commitadas no repositorio.

## Parte 7: Integracao do frontend com o backend

O frontend React precisa saber para onde enviar as chamadas da API. Em producao, essa URL e definida durante o build por:

- `VITE_API_URL`

No deploy, usamos:

- `VITE_API_URL=https://deefy.olua.me/api/v1`

O frontend usa essa base para chamadas como:

- Buscar musicas.
- Buscar favoritos.
- Fazer login.
- Carregar usuario autenticado.
- Manipular playlists.

Arquivos relevantes:

- `frontend/src/services/api.js`: configura o cliente HTTP usado pelo frontend.
- `frontend/src/services/musicService.js`: centraliza chamadas relacionadas a musicas, playlists e favoritos.
- `frontend/src/pages/home.jsx`: chama a API para carregar as musicas da Home.
- `frontend/src/components/SongList.jsx`: renderiza musicas e busca informacoes de favoritos.

Explicacao para apresentar:

"O frontend nao acessa o banco diretamente. Ele conversa com o backend usando HTTP. O backend e quem valida regras, aplica seguranca, consulta o banco e devolve os dados no formato esperado pelo React."

## Parte 8: Deploy do frontend novo

O frontend mais recente foi puxado da branch `grupo4-front` do repositorio do grupo de frontend e colocado dentro da pasta `frontend` do projeto principal.

Durante a integracao, mantivemos os arquivos de infraestrutura necessarios para producao:

- `frontend/Dockerfile`
- `frontend/nginx.conf`

Motivo:

O frontend novo trouxe telas, componentes e rotas novas, mas o deploy em VPS precisava continuar sabendo como construir e servir a aplicacao. Por isso, a estrutura visual veio do frontend atualizado, enquanto os arquivos de deploy foram preservados para manter compatibilidade com Docker/Nginx.

## Parte 9: Investigacao de lentidao na Home

Apos o deploy, foi observado que a Home carregava as musicas, mas demorava muito para sair do skeleton.

Investigacao feita:

- O container do backend estava de pe.
- O container do frontend estava de pe.
- CPU e memoria estavam normais.
- A rota publica respondia.
- O problema aparecia principalmente na montagem dos dados da Home.

Fluxo encontrado:

1. `frontend/src/pages/home.jsx` chama `musicService.getHomeMusics(12)`.
2. `frontend/src/services/musicService.js` chama `/musics/random?size=12`.
3. `backend/src/main/java/br/com/deefy/controller/MusicController.java` busca ate `size * 4` musicas para embaralhar.
4. Cada musica precisa do nome do artista.
5. No modelo `Music`, o artista estava configurado como `LAZY`.
6. Isso podia gerar varias queries separadas: uma para musicas e outras para artistas.
7. Depois disso, `SongList` tambem buscava favoritos.
8. Favoritos tambem carregavam musica e artista de forma lazy.

Conclusao:

O problema era um caso classico de N+1 queries. A aplicacao nao estava necessariamente lenta por CPU, memoria ou VPS, mas por fazer consultas pequenas demais e repetidas demais ao banco.

## Parte 10: Otimizacao aplicada em 2026-05-24

Objetivo:

Reduzir o numero de queries executadas na Home e na listagem de favoritos, sem alterar o schema do banco de dados.

Arquivos alterados:

- `backend/src/main/java/br/com/deefy/repository/MusicRepository.java`
- `backend/src/main/java/br/com/deefy/repository/FavoriteRepository.java`
- `backend/src/main/java/br/com/deefy/service/impl/MusicServiceImpl.java`

Alteracao em `MusicRepository.java`:

- Foi adicionado `@EntityGraph(attributePaths = "artist")` nas consultas de musica.
- Isso instrui o JPA/Hibernate a carregar a entidade `Music` junto com o relacionamento `artist`.
- Tambem foi criado o metodo `findWithArtistById(Long id)` para buscar detalhes de uma musica ja trazendo o artista.

Motivo:

Evitar que, para cada musica retornada, o Hibernate precise fazer uma nova query apenas para descobrir o artista.

Alteracao em `FavoriteRepository.java`:

- Foi adicionado `@EntityGraph(attributePaths = {"musica", "musica.artist"})` na listagem de favoritos.

Motivo:

Quando o frontend pergunta quais musicas estao favoritedas, o backend agora pode trazer favorito, musica e artista de forma mais eficiente.

Alteracao em `MusicServiceImpl.java`:

- O metodo `findMusicById` passou a usar `findWithArtistById`.

Motivo:

Garantir que detalhes de uma musica tambem venham com artista carregado, evitando lazy loading desnecessario.

Impacto esperado:

- Menos queries ao carregar a Home.
- Menos queries ao carregar favoritos.
- Menor tempo de resposta percebido no frontend.
- Menor pressao no banco PostgreSQL/Supabase.
- Nenhuma alteracao no schema do banco.

Ponto importante:

Essa otimizacao mexe apenas na forma como o backend consulta os dados. Ela nao cria tabela, nao remove coluna, nao altera relacionamento fisico e nao muda migracao.

## Parte 11: Como explicar a otimizacao na apresentacao

Sugestao de fala:

"Depois do deploy, percebemos que a Home carregava, mas demorava muito para sair do estado de carregamento. Investigamos os containers e vimos que nao era falta de CPU nem memoria. O problema estava na forma como o backend buscava os dados. As musicas eram buscadas primeiro, e depois o artista de cada musica podia ser buscado separadamente. Isso e conhecido como problema N+1. Para resolver, usamos `@EntityGraph` nos repositories do Spring Data JPA, dizendo explicitamente que musica e artista devem ser carregados juntos. Fizemos o mesmo para favoritos, trazendo favorito, musica e artista em uma consulta mais eficiente. Assim melhoramos performance sem mexer no schema do banco."

## Parte 12: Garantia sobre o banco de dados

Nesta etapa, nao houve alteracao de schema.

Nao foi feito:

- `ALTER TABLE`
- `CREATE TABLE`
- `DROP TABLE`
- Criacao de coluna
- Remocao de coluna
- Alteracao de foreign key
- Alteracao de enum
- Migracao de schema

O backend permanece com:

- `spring.jpa.hibernate.ddl-auto=none`

Isso reforca que o Hibernate nao deve modificar automaticamente o banco em producao.

## Parte 13: Importacao administrativa de playlists do YouTube

Depois de validar a ideia no sandbox, a funcionalidade de importacao por playlist foi integrada ao painel administrativo do projeto principal.

A proposta da funcionalidade:

- O administrador cola o link de uma playlist do YouTube.
- O administrador informa manualmente o genero que sera aplicado as musicas importadas.
- O backend executa um script em background.
- O script usa `yt-dlp` para ler metadados e baixar os audios.
- O `ffmpeg` converte os arquivos para MP3.
- Os arquivos de audio e imagem sao enviados ao Supabase Storage.
- O banco PostgreSQL/Supabase recebe os registros de artista, playlist, musica e vinculos.

Fluxo de dados:

1. O frontend envia `playlistUrl`, `genre`, `playlistTitle`, `artistName` e `limit` para a API.
2. A API recebe a requisicao em `/api/v1/admin/playlist-imports/youtube`.
3. O backend dispara `tools/import_youtube_playlist_to_supabase.py` em background.
4. O script consulta a playlist no YouTube com uma chamada inicial ao `yt-dlp`.
5. O script identifica o canal principal como artista.
6. Para reduzir bloqueios do YouTube, o script reutiliza os dados retornados pela playlist em vez de fazer uma chamada extra de metadados para cada video.
7. Se nenhuma faixa for acessivel para download, a importacao aborta antes de criar artista ou playlist vazia.
8. Antes de criar artista, o script procura em `artista` pelo mesmo `nome`.
9. A comparacao de artista ignora acento, maiusculas/minusculas e espacos repetidos.
10. Assim `matue`, `MatuE` e `Matuê` apontam para o mesmo artista quando ja existir.
11. Se ja existir, reutiliza o artista.
12. Se nao existir, cria o artista com `nome`, `bio` e `fotourl`.
13. Antes de criar a playlist, o script procura em `playlist` pelo mesmo `nome` e `usuario_id`, tambem com comparacao normalizada.
14. Se ja existir, reutiliza a playlist global.
15. Se nao existir, cria uma playlist publica.
16. Para cada video acessivel, antes de baixar qualquer arquivo, procura em `musica` pelo mesmo `titulo` e `artista_id`, tambem com comparacao normalizada.
17. Se a musica ja existir, o script pula download/upload e apenas garante o vinculo em `playlist_musica`.
18. Se a musica nao existir, baixa o audio, sobe o MP3 no bucket de musicas e sobe capa/thumbnail no bucket de imagens.
19. Depois cria a musica com `titulo`, `genero`, `duracao`, `arquivourl`, `capaurl` e `artista_id`.
20. O script cria o vinculo em `playlist_musica`, evitando duplicar vinculo ja existente.
21. Se detectar participacoes por termos como `feat`, `ft`, `with`, `x` ou `&`, cria/reutiliza os artistas convidados.
22. Se a tabela `musica_artista` existir no banco, registra o vinculo como `FEAT`.
23. Se a tabela `musica_artista` nao existir, apenas avisa no log e continua a importacao.
24. Se parte da playlist falhar, a importacao fica parcial e pode ser executada novamente.
25. Ao executar novamente, as faixas ja importadas sao reutilizadas e o script tenta importar apenas as que ainda faltam.

Ponto essencial:

Essa feature continua sem alterar schema. Ela trabalha somente com as tabelas que ja existem e se adapta quando `musica_artista` nao esta disponivel.

Arquivos alterados para a importacao:

- `tools/import_youtube_playlist_to_supabase.py`: script Python que conversa com YouTube, Supabase REST e Supabase Storage.
- `backend/src/main/java/br/com/deefy/controller/AdminPlaylistImportController.java`: endpoint administrativo para iniciar e consultar importacoes.
- `backend/src/main/java/br/com/deefy/service/YoutubePlaylistImportService.java`: executa o script em background e guarda o status do job.
- `backend/src/main/java/br/com/deefy/dto/request/YoutubePlaylistImportRequestDTO.java`: contrato da requisicao enviada pelo frontend.
- `backend/src/main/java/br/com/deefy/dto/response/YoutubePlaylistImportJobResponseDTO.java`: contrato da resposta com status e log.
- `backend/src/main/java/br/com/deefy/config/SecurityConfig.java`: protege `/api/v1/admin/**` para acesso apenas de `ROLE_ADMIN`.
- `frontend/src/services/adminService.js`: adiciona chamadas para iniciar importacao e consultar job.
- `frontend/src/pages/AdminPanel.jsx`: adiciona a aba `Importar` no painel admin.
- `frontend/src/pages/AdminPanel.css`: adiciona estilo para o log da importacao.
- `backend/Dockerfile`: instala `python3`, ambiente isolado do `yt-dlp` e `ffmpeg` no container do backend, alem de copiar `tools/`.
- `docker-compose.prod.yml`: repassa as variaveis de ambiente usadas pela importacao no container de producao.

Como explicar na apresentacao:

"A professora pediu uma prova de capacidade de popular um banco PostgreSQL/Supabase usando logica de programacao. Para isso, criamos uma importacao administrativa por playlist do YouTube. O admin informa o link e o genero, e o backend executa um script que baixa os audios, sobe os arquivos no Supabase Storage e cria os registros no banco. A logica evita duplicidade procurando artista, playlist, musica e vinculo antes de inserir. Tambem tenta detectar participacoes automaticamente e registra como feat quando a tabela de relacionamento existir. Tudo isso acontece sem criar tabela, sem criar coluna e sem alterar o schema."

Correcao de duplicidade feita depois dos primeiros testes:

- O campo de genero da tela de importacao deixou de ser texto livre e virou `select`.
- O usuario agora escolhe um genero ja cadastrado, evitando variacoes como `trap`, `Trap` e `TRAP`.
- O campo de artista ficou pesquisavel e editavel: o admin pode escolher uma sugestao existente ou digitar manualmente.
- Se nenhum artista for informado, o script detecta pelo YouTube.
- Mesmo quando o nome vem do YouTube, a deduplicacao compara nomes sem acento e sem diferenciar maiuscula/minuscula.
- O script tambem passou a reutilizar playlists e musicas por comparacao normalizada.
- Erros do `yt-dlp` agora exibem a mensagem real, como video com restricao de idade, bloqueio regional, login obrigatorio ou limite de requisicoes do YouTube.
- Se todos os videos estiverem indisponiveis, a importacao falha antes de criar artista ou playlist vazia.
- Se apenas alguns videos falharem, a importacao fica parcial e pode ser retomada sem duplicar ou reupar as musicas ja importadas.

Correcao contra bloqueio anti-bot do YouTube:

- O erro `Sign in to confirm you're not a bot` indica bloqueio do YouTube contra a VPS, nao erro de schema ou duplicidade.
- O erro `HTTP 429 Too Many Requests` indica excesso de requisicoes ou reputacao temporariamente limitada do IP.
- Para reduzir esse risco, o script deixou de chamar `yt-dlp -J` para cada video antes do download.
- O container do backend passou a incluir `nodejs`, usado pelo `yt-dlp` como runtime JavaScript quando necessario.
- O `docker-compose.prod.yml` passou a montar `./secrets` em `/app/secrets`.
- Se existir `/app/secrets/youtube-cookies.txt`, o script usa esse arquivo automaticamente com `--cookies`.
- O arquivo de cookies nao deve ser commitado; ele fica fora do Git em `secrets/`.
- A variavel `YTDLP_SLEEP_REQUESTS` permite inserir pausa entre requisicoes internas do `yt-dlp`.

Validacoes feitas:

- `python3 -m py_compile tools/import_youtube_playlist_to_supabase.py`
- `./mvnw test`
- `npm run build`

Observacao importante:

Durante os testes automatizados, o Hibernate cria e remove tabelas apenas no banco H2 em memoria usado pelos testes. Isso nao afeta o PostgreSQL/Supabase real.

## Registro de alteracoes tecnicas

### 2026-05-24: Deploy do frontend atualizado e backend recente

Arquivos/diretorios envolvidos:

- `frontend/`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `backend/`
- `docker-compose.prod.yml`

Resumo:

- O frontend foi atualizado a partir da branch `grupo4-front`.
- O backend foi atualizado com o commit recente da branch `staging`.
- O build local do frontend foi validado.
- Os testes do backend foram executados.
- O deploy foi feito na VPS usando Docker Compose.

Observacao:

Nao foi feita alteracao no schema do banco.

### 2026-05-24: Otimizacao de carregamento da Home e favoritos

Arquivos alterados:

- `backend/src/main/java/br/com/deefy/repository/MusicRepository.java`
- `backend/src/main/java/br/com/deefy/repository/FavoriteRepository.java`
- `backend/src/main/java/br/com/deefy/service/impl/MusicServiceImpl.java`
- `backend/src/test/java/br/com/deefy/service/impl/MusicServiceImplTest.java`
- `backend/src/test/java/br/com/deefy/service/MusicServiceTest.java`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- Adicionado `@EntityGraph` para carregar `Music.artist` junto com musicas.
- Adicionado `@EntityGraph` para carregar `Favorite.musica` e `Favorite.musica.artist` junto com favoritos.
- Ajustado `findMusicById` para usar consulta com artista carregado.
- Atualizados testes unitarios para mockar/verificar `findWithArtistById`, refletindo o novo caminho otimizado.
- Criado este roteiro vivo para documentar as proximas alteracoes.

Motivo:

Reduzir N+1 queries e melhorar o tempo de carregamento da Home.

Impacto esperado:

- Menos consultas repetidas ao banco.
- Home mais rapida.
- Favoritos mais leves.
- Nenhuma mudanca no schema.

### 2026-05-24: Aba admin para importar playlist do YouTube

Arquivos alterados:

- `tools/import_youtube_playlist_to_supabase.py`
- `backend/src/main/java/br/com/deefy/controller/AdminPlaylistImportController.java`
- `backend/src/main/java/br/com/deefy/service/YoutubePlaylistImportService.java`
- `backend/src/main/java/br/com/deefy/dto/request/YoutubePlaylistImportRequestDTO.java`
- `backend/src/main/java/br/com/deefy/dto/response/YoutubePlaylistImportJobResponseDTO.java`
- `backend/src/main/java/br/com/deefy/config/SecurityConfig.java`
- `backend/Dockerfile`
- `docker-compose.prod.yml`
- `frontend/src/services/adminService.js`
- `frontend/src/pages/AdminPanel.jsx`
- `frontend/src/pages/AdminPanel.css`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- Adicionada importacao de playlist do YouTube no painel admin.
- O frontend ganhou a aba `Importar`.
- O backend ganhou endpoint administrativo para iniciar e consultar jobs.
- O container do backend passou a incluir Python, `yt-dlp` e `ffmpeg`.
- O script evita duplicar artistas, playlists, musicas e vinculos.
- O script tenta vincular feats somente se a tabela `musica_artista` existir.

Impacto esperado:

- Admin consegue popular o catalogo por playlist diretamente pela interface.
- O processo fica demonstravel na apresentacao sem depender de terminal.
- O schema do banco continua inalterado.

### 2026-05-24: Correcao anti-duplicidade na importacao por playlist

Arquivos alterados:

- `tools/import_youtube_playlist_to_supabase.py`
- `frontend/src/services/adminService.js`
- `frontend/src/pages/AdminPanel.jsx`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- A importacao agora compara artista, playlist e musica por nome normalizado.
- A normalizacao remove acentos, ignora maiusculas/minusculas e padroniza espacos.
- A tela passou a carregar ate 1000 generos/artistas para os selects administrativos.
- O genero da importacao passou a ser escolhido por select, nao digitado livremente.
- O artista da importacao passou a ter sugestoes pesquisaveis, mas continua editavel para casos em que o canal do YouTube nao e o nome artistico correto.
- O script passou a mostrar o erro real do `yt-dlp`.
- O script passou a validar metadados de faixas antes de criar artista/playlist.

Motivo:

Evitar duplicidades como `matue`, `MatuE` e `Matuê`, reduzir erro humano na escolha de genero e impedir playlist vazia quando todos os videos da playlist estiverem bloqueados.

Observacao sobre YouTube:

Algumas falhas nao sao erro do Deefy. No teste com Matuê, o `yt-dlp` indicou `HTTP 429 Too Many Requests` e video com restricao de idade. Nesses casos, a importacao precisa pular a faixa ou falhar com mensagem clara, porque o YouTube nao entregou o conteudo para download naquele ambiente.

### 2026-05-24: Importacao parcial retomavel

Arquivos alterados:

- `tools/import_youtube_playlist_to_supabase.py`
- `frontend/src/pages/AdminPanel.jsx`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- O fluxo voltou a processar video por video, como no teste do sandbox, em vez de validar metadados de todos os videos antes de iniciar a importacao.
- A importacao so cria artista e playlist quando encontra a primeira faixa realmente acessivel.
- A importacao passou a verificar se a musica ja existe antes de baixar audio ou subir arquivo no Supabase Storage.
- Quando a musica ja existe para o mesmo artista, o script apenas garante o vinculo com a playlist e pula download/upload.
- Se uma playlist tiver, por exemplo, 14 videos e 2 falharem, a importacao salva os 12 que deram certo.
- Ao rodar a mesma playlist novamente, os 12 ja importados sao reutilizados e o script tenta importar somente os 2 que faltaram.
- Se nenhum video estiver acessivel, a importacao continua abortando antes de criar artista ou playlist vazia.
- Na tela de importacao, o campo de artista ficou livre com sugestoes, permitindo informar manualmente `Matuê` mesmo quando a playlist pertence a um canal como `30PRAUM`.

Motivo:

Tornar a populacao do banco mais resistente a falhas externas do YouTube, como video privado, restricao de idade, bloqueio regional, limite de requisicoes ou instabilidade temporaria do `yt-dlp`, sem causar duplicidade no catalogo.

### 2026-05-24: Mitigacao de bloqueio anti-bot do YouTube

Arquivos alterados:

- `tools/import_youtube_playlist_to_supabase.py`
- `backend/Dockerfile`
- `docker-compose.prod.yml`
- `.gitignore`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- A VPS recebeu erro real do YouTube: `Sign in to confirm you're not a bot` junto com `HTTP 429 Too Many Requests`.
- Isso indica bloqueio externo do YouTube contra o ambiente de execucao, nao erro de modelagem do banco.
- O script foi ajustado para reduzir chamadas ao `yt-dlp`: ele nao faz mais uma consulta de metadados para cada video antes de baixar.
- O download continua sendo feito video a video, permitindo retomar importacao parcial sem duplicar registros.
- O container do backend passou a instalar `nodejs`, para o `yt-dlp` ter runtime JavaScript disponivel.
- O compose passou a montar `./secrets` em `/app/secrets` somente para leitura.
- Se o arquivo `/app/secrets/youtube-cookies.txt` existir, o script usa cookies automaticamente.
- `.gitignore` passou a ignorar `secrets/` e `.env`, evitando commit acidental de credenciais.

Como explicar:

"Quando colocamos a feature em producao, o YouTube identificou muitas requisicoes vindas da VPS e retornou anti-bot/429. A solucao nao foi alterar banco nem burlar schema; foi tornar a integracao mais responsavel: reduzir chamadas repetidas, adicionar runtime JavaScript para o `yt-dlp` e preparar suporte seguro a cookies fora do Git. Assim a importacao continua demonstravel, mas respeita que o YouTube pode bloquear downloads dependendo do IP, login, regiao ou limite temporario."

### 2026-05-24: Correcao de visibilidade do log da importacao

Arquivos alterados:

- `frontend/src/pages/AdminPanel.jsx`
- `backend/src/main/java/br/com/deefy/service/YoutubePlaylistImportService.java`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- A tela de importacao mostrava apenas as ultimas 18 linhas do job.
- Quando a playlist tinha muitos videos, as mensagens reais de erro podiam ficar fora desse recorte.
- A tela passou a mostrar ate 180 linhas recentes do log.
- O backend passou a executar o Python com `python3 -u`.
- Tambem foi definida a variavel `PYTHONUNBUFFERED=1` para reduzir atraso e inversao de ordem entre logs normais e erros.

Motivo:

Facilitar a apresentacao e a depuracao. Se o YouTube bloquear uma playlist, o professor e a equipe conseguem ver a causa real no painel admin, como `HTTP 429`, login obrigatorio, video privado ou restricao regional.

### 2026-05-24: Abortagem antecipada em bloqueio global do YouTube

Arquivos alterados:

- `tools/import_youtube_playlist_to_supabase.py`
- `docker-compose.prod.yml`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- O log mostrou que todos os videos da playlist retornavam `HTTP 429 Too Many Requests` e `Sign in to confirm you're not a bot`.
- Isso nao e uma falha isolada de faixa; e um bloqueio global do YouTube contra a VPS/IP.
- O script passou a detectar esse padrao e abortar a importacao imediatamente.
- Antes, ele tentava todos os videos e piorava o rate-limit.
- O `yt-dlp` passou a receber o runtime JavaScript como `node:/usr/bin/node`, deixando explicito o caminho do Node dentro do container.

Como explicar:

"Quando percebemos que o bloqueio nao era de uma musica especifica, mas do IP inteiro da VPS, ajustamos a logica para parar cedo. Isso evita bater 14 vezes no YouTube quando a primeira resposta ja diz que o ambiente foi bloqueado. E uma decisao de engenharia: falhar rapido, explicar claramente o motivo e proteger a integracao contra repeticao desnecessaria."

### 2026-05-24: Procedimento seguro para cookies do YouTube

Arquivos alterados:

- `tools/upload_youtube_cookies_to_vps.sh`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- O YouTube pode bloquear IPs de VPS com `HTTP 429` e `Sign in to confirm you're not a bot`.
- Para esse caso, o `yt-dlp` suporta cookies exportados do navegador em formato `cookies.txt`.
- Nao automatizamos login do Google no servidor por seguranca.
- O cookie e tratado como segredo operacional, fora do Git.
- A pasta remota usada e `/home/olua_developer/deefy/secrets`.
- O arquivo esperado e `/home/olua_developer/deefy/secrets/youtube-cookies.txt`.
- O compose monta essa pasta no container como `/app/secrets`.
- O script detecta `/app/secrets/youtube-cookies.txt` automaticamente e usa `--cookies`.

Comando para enviar cookies exportados:

```bash
./tools/upload_youtube_cookies_to_vps.sh ~/Downloads/youtube-cookies.txt
```

Como explicar:

"Quando o YouTube exige confirmacao anti-bot, a aplicacao nao guarda senha nem automatiza login do Google. A equipe exporta cookies de uma sessao autorizada em formato `cookies.txt`, envia para a VPS como secret fora do Git, e o container monta esse arquivo somente em runtime. Assim mantemos seguranca, auditabilidade e separacao entre codigo e credenciais."

### 2026-05-24: Upload/colagem de cookies pela tela admin

Arquivos alterados:

- `backend/src/main/java/br/com/deefy/controller/AdminPlaylistImportController.java`
- `backend/src/main/java/br/com/deefy/service/YoutubePlaylistImportService.java`
- `backend/src/main/java/br/com/deefy/dto/request/YoutubeCookiesRequestDTO.java`
- `backend/src/main/java/br/com/deefy/dto/response/YoutubeCookiesStatusResponseDTO.java`
- `frontend/src/services/adminService.js`
- `frontend/src/pages/AdminPanel.jsx`
- `frontend/src/pages/AdminPanel.css`
- `docker-compose.prod.yml`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- A tela admin de importacao ganhou um tutorial para exportar cookies do YouTube em formato Netscape `cookies.txt`.
- O administrador pode selecionar um arquivo `.txt` ou colar o conteudo diretamente no painel.
- O frontend envia o conteudo para `/api/v1/admin/playlist-imports/youtube-cookies`.
- O backend valida se o arquivo parece ser um `cookies.txt` do YouTube/Google.
- O conteudo e salvo em `/app/secrets/youtube-cookies.txt`, fora do Git.
- A API retorna apenas status, tamanho e data de atualizacao; nunca retorna o conteudo dos cookies.
- O volume `./secrets:/app/secrets` ficou gravavel para permitir que o backend atualize o secret pela tela admin.
- O importador continua consumindo o arquivo automaticamente pelo `yt-dlp`.

Motivo:

Antes, a equipe precisava exportar cookies localmente e enviar para a VPS via terminal. Isso funciona, mas e ruim para apresentacao e para uso administrativo. Com a nova tela, o fluxo fica guiado: o admin aprende o que precisa exportar, cola ou envia o arquivo e roda a importacao novamente sem mexer em SSH.

Como explicar:

"O YouTube pode bloquear IPs de VPS e pedir confirmacao anti-bot. Em vez de tentar contornar isso de forma insegura, criamos um fluxo administrativo: a pessoa logada no YouTube exporta seus cookies autorizados em formato `cookies.txt`, cola ou envia esse arquivo no painel admin, e o backend salva como secret operacional fora do codigo. A aplicacao nao guarda senha, nao retorna os cookies pela API e nao altera schema de banco. Ela apenas fornece ao `yt-dlp` uma sessao autorizada para tentar a importacao novamente."

### 2026-05-24: Correcao do solver EJS do yt-dlp

Arquivos alterados:

- `backend/Dockerfile`
- `docker-compose.prod.yml`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- Depois dos cookies, o erro mudou: saiu de `HTTP 429/not a bot` para `Signature solving failed` e `n challenge solving failed`.
- Isso indica que o YouTube entregou a pagina, mas o `yt-dlp` nao conseguiu resolver os desafios JavaScript do player.
- A imagem anterior instalava `yt-dlp` via pip sem o grupo de dependencias `default`.
- Esse grupo instala tambem o pacote `yt-dlp-ejs`, necessario para resolver os desafios modernos do YouTube.
- A imagem anterior tambem usava Node vindo do `apt`, que era `18.19.1`.
- A documentacao atual do `yt-dlp` exige Node `20+` ou outro runtime suportado.
- Como o Deno e recomendado pelo guia EJS do `yt-dlp`, a imagem passou a instalar Deno e o compose passou a usar `YTDLP_JS_RUNTIME=deno:/usr/local/bin/deno`.
- O `yt-dlp` passou a ser instalado com `pip install "yt-dlp[default]"`, incluindo os componentes EJS compativeis.
- Validacao em producao: `yt-dlp --list-formats` passou a mostrar `[jsc:deno] Solving JS challenges using deno` e voltou a listar formatos de audio.
- Validacao pratica: um download isolado para `/tmp` no container gerou MP3 com `status=0`, sem gravar nada no banco.

Motivo:

Cookies resolvem autenticacao/anti-bot, mas nao resolvem assinatura de formatos. Para o YouTube entregar URLs reais de audio/video, o `yt-dlp` precisa executar o desafio JavaScript do player usando runtime suportado e scripts EJS atualizados.

Como explicar:

"A integracao teve duas camadas de bloqueio. A primeira era anti-bot/login, resolvida com cookies exportados. A segunda era tecnica: o YouTube usa desafios JavaScript para proteger as URLs reais dos formatos. O `yt-dlp` moderno precisa de um runtime JS suportado e do pacote `yt-dlp-ejs`. Ajustamos o container Docker para instalar esses componentes corretamente, sem alterar o banco e sem mudar a regra de negocio."

### 2026-05-24: Playlists importadas como globais

Arquivos alterados:

- `backend/src/main/java/br/com/deefy/repository/PlaylistRepository.java`
- `backend/src/main/java/br/com/deefy/service/PlaylistService.java`
- `backend/src/main/java/br/com/deefy/service/impl/PlaylistServiceImpl.java`
- `backend/src/main/java/br/com/deefy/controller/PlaylistController.java`
- `backend/src/main/java/br/com/deefy/mapper/PlaylistMapper.java`
- `frontend/src/services/musicService.js`
- `frontend/src/pages/Playlists.jsx`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- As playlists importadas pelo painel admin passam a ser tratadas como playlists globais.
- Nao foi criada tabela, coluna ou alteracao de schema.
- A regra usa o usuario sistema/admin configurado em `DEEFY_IMPORT_OWNER_EMAIL`, por padrao `deefy.admin@deefy.com`.
- Playlists publicas desse usuario deixam de aparecer em `Suas playlists`.
- Foi criado o endpoint `GET /api/v1/playlists/global` para listar as playlists globais.
- O endpoint `GET /api/v1/playlists/{id}` passou a permitir acesso a playlists publicas, alem das playlists do proprio usuario.
- A tela `/playlists` passou a misturar as playlists globais com os cards de estilos em `Explore novos estilos`.
- Dentro do detalhe de uma playlist importada, o campo visual `ALBUM` das musicas passa a receber o nome da playlist, por exemplo `CAOS`.

Motivo:

A importacao de playlist do YouTube representa, visualmente, um lancamento/album, mas o schema atual nao usa mais tabela `album`. A solucao correta para este momento e manter a playlist importada como colecao tocavel global e usar o nome da playlist como album visual apenas na resposta da API, sem persistir uma nova estrutura no banco.

Como explicar:

"Como nao queremos alterar o schema do banco, definimos uma regra de aplicacao: toda playlist publica pertencente ao usuario sistema/admin e uma playlist global. Ela nao aparece como playlist pessoal, aparece na area de descoberta junto dos estilos. E, quando abrimos essa playlist, as faixas exibem o nome da propria playlist no campo visual de album. Assim a UI preserva a ideia de album/lancamento sem recriar a tabela Album."

### 2026-05-24: Ajustes de reproducao em playlists globais e estilos

Arquivos alterados:

- `frontend/nginx.conf`
- `frontend/src/components/SongList.jsx`
- `frontend/src/components/SongOptionsMenu.jsx`
- `frontend/src/utils/musicNormalizer.js`
- `frontend/src/services/musicService.js`
- `frontend/src/pages/Playlists.jsx`
- `frontend/src/pages/Playlists.css`
- `frontend/src/pages/UserPlaylistDetail.jsx`
- `tools/import_youtube_playlist_to_supabase.py`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- A API de playlist envia a URL real de audio no campo `arquivoUrl`.
- O normalizador do frontend agora aceita `arquivoUrl` e `arquivourl`, alem de `audioUrl`, `fileUrl` e `previewUrl`.
- Isso corrige o caso em que a musica aparecia no detalhe da playlist global, mas o player ficava cinza e nao reproduzia.
- O card de playlist global em `Explore novos estilos` nao exibe mais o texto automatico `Playlist global do Deefy`.
- Os cards de genero deixaram de mostrar o alerta `Navegacao por genero em construcao`.
- Ao clicar em um genero, o frontend chama a busca real por genero e inicia a reproducao da primeira musica encontrada, usando a lista do genero como fila do player.
- O script de importacao passou a tratar thumbnails/capas do YouTube como opcionais.
- Se uma thumbnail expirar ou responder `HTTP Error 404`, a importacao registra aviso e continua importando o audio e os metadados da faixa.
- Playlists publicas/globais nao exibem botoes de adicionar musica, editar ou excluir para usuarios normais.
- No detalhe de playlist publica, as opcoes por faixa tambem nao permitem remover musica daquela playlist.
- O `index.html` do frontend passou a ser servido com `Cache-Control: no-store/no-cache`, evitando que o navegador mantenha bundles antigos depois de deploy.
- Os assets versionados em `/assets/` continuam cacheaveis por longo prazo, pois o Vite gera nomes com hash.
- Nao houve alteracao de schema de banco.

Motivo:

O comportamento esperado e que qualquer musica visivel na interface seja tocavel. A falha acontecia porque a busca da home normalizava bem as musicas, mas a resposta de playlist usava o nome original do DTO Java (`arquivoUrl`). Como esse campo nao era reconhecido pelo player, a faixa chegava sem audio. Ja o erro `HTTP Error 404` durante importacao vinha de capas do YouTube, nao necessariamente do audio; por isso nao deve derrubar a faixa inteira.

Como explicar:

"Ajustamos uma camada de compatibilidade entre backend e frontend. O backend Java chama o campo de audio de `arquivoUrl`, seguindo o modelo do banco. O player do frontend esperava nomes como `audioUrl` ou `fileUrl`. Criamos a ponte no normalizador para que a tela nao dependa de um unico nome de campo. Tambem removemos um placeholder de generos e passamos a tocar musicas reais por genero. Na importacao, se a capa do YouTube falhar, a musica continua entrando, porque a capa e opcional e o audio e o dado principal."

### 2026-05-24: Migracao final curada para `main`

Arquivos alterados:

- `frontend/src/main.jsx`
- `frontend/src/pages/home.jsx`
- `frontend/src/pages/home.css`
- `frontend/src/pages/Artists.jsx`
- `frontend/src/pages/SystemPlaylists.jsx`
- `frontend/src/pages/SharedMusic.jsx`
- `frontend/src/pages/SharedMusic.css`
- `frontend/src/pages/Catalog.css`
- `frontend/src/hooks/useMusicSearch.js`
- `frontend/src/components/SearchBar.jsx`
- `frontend/src/components/SongOptionsMenu.jsx`
- `frontend/src/routes/PlayerController.jsx`
- `frontend/src/utils/recommendationEngine.js`
- `frontend/src/services/musicService.js`
- `backend/src/main/java/br/com/deefy/controller/MusicController.java`
- `backend/src/main/java/br/com/deefy/repository/MusicRepository.java`
- `backend/src/main/java/br/com/deefy/service/MusicService.java`
- `backend/src/main/java/br/com/deefy/service/impl/MusicServiceImpl.java`
- `backend/src/test/java/br/com/deefy/service/impl/MusicServiceImplTest.java`
- `docs/roteiro-apresentacao-deploy-integracao.md`

Resumo:

- A `staging` foi preservada como branch de reserva.
- A integracao final foi feita em `release/main-apresentacao`, partindo de `origin/staging`.
- A base final incorporou os commits recentes da `staging`, incluindo `Music.setId` e testes de historico de reproducao.
- A branch `main` passa a ser o alvo oficial da apresentacao e do deploy final.
- A integracao do frontend novo foi curada, nao uma copia bruta.
- Foram trazidas as rotas `/artists`, `/system-playlists` e `/music/:id`.
- A Home ganhou filtros visuais de busca por tudo, musicas, generos, albuns, artistas e playlists.
- A Home tambem passou a exibir cards recomendados de playlists globais e artistas.
- O compartilhamento de musica usa link real em `/music/:id`.
- O menu de opcoes das musicas passou a listar playlists reais do usuario ao adicionar faixa.
- Foi preservado o suporte a `arquivoUrl` e `arquivourl` no normalizador.
- Foi preservada a regra de playlists globais sem botoes de gestao para usuario comum.
- Foi preservada a aba admin de importacao YouTube e upload/colagem de cookies.
- Foi preservado o `index.html` sem cache no Nginx para evitar bundle antigo depois do deploy.
- O player passou a aparecer tambem em playlists, artistas, playlists do sistema e links compartilhados.

Novas rotas de frontend:

- `/artists`: catalogo de artistas, com cards em destaque e link para filtrar a Home por artista.
- `/system-playlists`: catalogo de playlists globais do Deefy.
- `/music/:id`: rota de compartilhamento que carrega a musica pelo backend e inicia o player.

Novas rotas de backend:

- `GET /api/v1/musics/search/genre?genre=...`
- `GET /api/v1/musics/search/album?album=...`

Observacao sobre album:

O schema atual nao tem uma tabela fisica de album no fluxo principal. Por isso, a busca por album funciona como conceito visual compatibilizado com os dados existentes, usando o campo disponivel de genero/album visual sem alterar schema.

Motivo:

Levar o sistema para a `main` com estabilidade para a apresentacao, mantendo a `staging` como plano de reserva. Como a apresentacao e amanha, a decisao foi integrar apenas funcionalidades seguras do front novo e manter todas as correcoes de producao ja validadas.

Impacto:

- A experiencia do usuario fica mais completa sem trocar o backend por mocks.
- A busca passa a cobrir mais categorias sem quebrar a busca antiga.
- Playlists globais continuam tocaveis e protegidas contra edicao indevida.
- O admin continua com a importacao YouTube funcional.
- Nao houve `ALTER TABLE`, `CREATE TABLE`, `DROP TABLE`, migration ou mudanca de schema.

## Checklist final para a apresentacao

- Mostrar que o dominio publico esta online.
- Explicar separacao frontend/backend.
- Mostrar que o frontend chama a API, nao o banco.
- Explicar Docker como padronizacao de ambiente.
- Explicar VPS como servidor.
- Explicar Traefik como proxy reverso.
- Explicar Tailscale como acesso seguro/privado de administracao.
- Explicar Cloudflare como DNS/dominio.
- Explicar variaveis de ambiente como protecao de credenciais.
- Explicar `ddl-auto=none` como protecao contra mudanca automatica de schema.
- Mostrar investigacao real de performance.
- Explicar N+1 queries de forma simples.
- Explicar `@EntityGraph` como solucao sem mudar banco.
- Mostrar a aba admin de importacao de playlist.
- Explicar a deduplicacao antes dos inserts.
- Reforcar que a importacao adiciona dados, mas nao altera schema.
- Mostrar as rotas novas `/artists`, `/system-playlists` e `/music/:id`.
- Explicar que `main` virou a branch final da apresentacao e `staging` ficou preservada como reserva.
