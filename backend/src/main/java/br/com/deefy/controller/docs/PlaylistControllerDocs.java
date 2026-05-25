package br.com.deefy.controller.docs;

import br.com.deefy.dto.request.PlaylistRequestDTO;
import br.com.deefy.dto.response.PlaylistResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;

@Tag(name = "Playlist", description = "Playlists do usuário autenticado e suas faixas")
public interface PlaylistControllerDocs {

    @Operation(
            summary = "Criar playlist",
            description = "Cria uma nova playlist vinculada ao usuário autenticado pelo JWT."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Playlist criada com sucesso",
                    content = @Content(schema = @Schema(implementation = PlaylistResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — dados ausentes ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<PlaylistResponseDTO> create(PlaylistRequestDTO request, Object principal);

    @Operation(
            summary = "Listar playlists do usuário",
            description = "Retorna todas as playlists pertencentes ao usuário autenticado pelo JWT."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de playlists retornada com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<List<PlaylistResponseDTO>> listAll(Object principal);

    @Operation(
            summary = "Buscar playlist por ID",
            description = "Retorna uma playlist específica do usuário autenticado. " +
                    "Retorna 403 caso a playlist pertença a outro usuário."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Playlist encontrada com sucesso",
                    content = @Content(schema = @Schema(implementation = PlaylistResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — a playlist pertence a outro usuário",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Playlist não encontrada para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<PlaylistResponseDTO> findById(Long id, Object principal);

    @Operation(
            summary = "Atualizar playlist",
            description = "Atualiza o nome e a visibilidade de uma playlist do usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Playlist atualizada com sucesso",
                    content = @Content(schema = @Schema(implementation = PlaylistResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — dados ausentes ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — a playlist pertence a outro usuário",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Playlist não encontrada para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<PlaylistResponseDTO> update(Long id, PlaylistRequestDTO request, Object principal);

    @Operation(
            summary = "Excluir playlist",
            description = "Exclui uma playlist do usuário autenticado permanentemente."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Playlist excluída com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — a playlist pertence a outro usuário",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Playlist não encontrada para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> delete(Long id, Object principal);

    @Operation(
            summary = "Adicionar música na playlist",
            description = "Inclui uma música existente no catálogo em uma playlist do usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Música adicionada com sucesso",
                    content = @Content(schema = @Schema(implementation = PlaylistResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — a playlist pertence a outro usuário",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Playlist ou música não encontrada para os IDs informados",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflito — a música já está presente na playlist",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<PlaylistResponseDTO> addMusic(Long playlistId, Long musicId, Object principal);

    @Operation(
            summary = "Remover música da playlist",
            description = "Remove uma música de uma playlist do usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Música removida com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — a playlist pertence a outro usuário",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Playlist ou música não encontrada para os IDs informados",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> removeMusic(Long playlistId, Long musicId, Object principal);
}
