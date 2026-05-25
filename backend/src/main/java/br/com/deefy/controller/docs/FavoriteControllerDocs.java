package br.com.deefy.controller.docs;

import br.com.deefy.dto.response.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;

@Tag(name = "Favorites", description = "Favoritos de músicas, artistas e gêneros do usuário autenticado")
public interface FavoriteControllerDocs {

    // -------------------------------------------------------------------------
    // Músicas
    // -------------------------------------------------------------------------

    @Operation(
            summary = "Listar músicas favoritas",
            description = "Retorna todas as músicas favoritadas pelo usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista retornada com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<List<FavoriteMusicResponseDTO>> listarMusicasFavoritas(Object principal);

    @Operation(
            summary = "Favoritar música",
            description = "Adiciona uma música aos favoritos do usuário autenticado. " +
                    "Caso já esteja favoritada, o registro existente é retornado sem duplicação."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Música favoritada com sucesso",
                    content = @Content(schema = @Schema(implementation = FavoriteMusicResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Música não encontrada para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<FavoriteMusicResponseDTO> favoritarMusica(Long musicId, Object principal);

    @Operation(
            summary = "Remover música dos favoritos",
            description = "Remove uma música dos favoritos do usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Música removida dos favoritos com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Música não encontrada ou não estava nos favoritos",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> desfavoritarMusica(Long musicId, Object principal);

    @Operation(
            summary = "Consultar status de música favorita",
            description = "Informa se uma música já está favoritada pelo usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Status retornado com sucesso",
                    content = @Content(schema = @Schema(implementation = FavoriteStatusResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Música não encontrada para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<FavoriteStatusResponseDTO> buscarStatusFavoritoMusica(Long musicId, Object principal);

    // -------------------------------------------------------------------------
    // Artistas
    // -------------------------------------------------------------------------

    @Operation(
            summary = "Listar artistas favoritos",
            description = "Retorna todos os artistas favoritados pelo usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista retornada com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<List<FavoriteArtistResponseDTO>> listarArtistasFavoritos(Object principal);

    @Operation(
            summary = "Favoritar artista",
            description = "Adiciona um artista aos favoritos do usuário autenticado. " +
                    "Caso já esteja favoritado, o registro existente é retornado sem duplicação."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Artista favoritado com sucesso",
                    content = @Content(schema = @Schema(implementation = FavoriteArtistResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Artista não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<FavoriteArtistResponseDTO> favoritarArtista(Long artistId, Object principal);

    @Operation(
            summary = "Remover artista dos favoritos",
            description = "Remove um artista dos favoritos do usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Artista removido dos favoritos com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Artista não encontrado ou não estava nos favoritos",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> desfavoritarArtista(Long artistId, Object principal);

    @Operation(
            summary = "Consultar status de artista favorito",
            description = "Informa se um artista já está favoritado pelo usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Status retornado com sucesso",
                    content = @Content(schema = @Schema(implementation = FavoriteStatusResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Artista não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<FavoriteStatusResponseDTO> buscarStatusFavoritoArtista(Long artistId, Object principal);

    // -------------------------------------------------------------------------
    // Gêneros
    // -------------------------------------------------------------------------

    @Operation(
            summary = "Listar gêneros favoritos",
            description = "Retorna todos os gêneros favoritados pelo usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista retornada com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<List<FavoriteGenreResponseDTO>> listarGenerosFavoritos(Object principal);

    @Operation(
            summary = "Favoritar gênero",
            description = "Adiciona um gênero aos favoritos do usuário autenticado. " +
                    "Caso já esteja favoritado, o registro existente é retornado sem duplicação."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Gênero favoritado com sucesso",
                    content = @Content(schema = @Schema(implementation = FavoriteGenreResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Gênero não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<FavoriteGenreResponseDTO> favoritarGenero(Long genreId, Object principal);

    @Operation(
            summary = "Remover gênero dos favoritos",
            description = "Remove um gênero dos favoritos do usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Gênero removido dos favoritos com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Gênero não encontrado ou não estava nos favoritos",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> desfavoritarGenero(Long genreId, Object principal);

    @Operation(
            summary = "Consultar status de gênero favorito",
            description = "Informa se um gênero já está favoritado pelo usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Status retornado com sucesso",
                    content = @Content(schema = @Schema(implementation = FavoriteStatusResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Gênero não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<FavoriteStatusResponseDTO> buscarStatusFavoritoGenero(Long genreId, Object principal);
}