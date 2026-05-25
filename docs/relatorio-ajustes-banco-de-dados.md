# Status dos ajustes no banco do Deefy

Data: 2026-05-25

## Resolvido

A tabela `playlist` ja recebeu as duas colunas que faltavam:

```sql
playlist.descricao TEXT
playlist.capaurl TEXT
```

Com isso, o backend e o frontend ja conseguem salvar e editar:

- descricao/bio da playlist;
- capa manual da playlist.

## Primeiro lote populado

Foi feito um lote pequeno e seguro, sem alterar schema:

- 6 playlists globais receberam descricao e capa usando capas de musicas ja existentes.
- 5 generos receberam capa usando capas de musicas ja existentes.
- 98 artistas receberam imagem provisoria usando a capa de uma musica ja existente.

Resultado:

- Playlists globais com musicas: completas.
- Artistas com foto/imagem: 104.
- Artistas sem foto, mas com capa de musica disponivel: 0.

## Limpeza feita

- A playlist global vazia `XTRANHO` foi removida.
- O genero vazio `So as Porcarias` foi removido.
- Os generos restantes sao: `Trash`, `Trap`, `Heavy Metal`, `Rock Alternativo` e `Anime`.

## Decisao visual sobre generos

Os cards de genero nao devem depender de capa no banco.

A UI passa a mostrar um card simples com icone de musica e nome do genero, parecido com a ideia visual simples do Spotify para generos/momentos.

## Ainda falta

- Revisar manualmente imagens de artistas que ficaram ruins, porque varias usam capa de musica como placeholder.
- Preencher `artista.bio` de forma melhor quando houver tempo.
- Manter populacao em lotes pequenos para evitar dados visuais errados perto da apresentacao.
