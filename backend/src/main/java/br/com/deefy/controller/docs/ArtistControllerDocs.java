package br.com.deefy.controller.docs;

import br.com.deefy.dto.request.ArtistRequestDTO;
import br.com.deefy.dto.response.AdminArtistResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

@Tag(name = "Artists", description = "Cadastro e consulta de artistas do catálogo")
public interface ArtistControllerDocs {

    @Operation(
            summary = "Listar artistas",
            description = "Retorna artistas paginados para catálogo e painel admin."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de artistas retornada com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Page<AdminArtistResponseDTO>> findAll(Pageable pageable);

    @Operation(
            summary = "Buscar artista por ID",
            description = "Retorna os dados de um artista específico pelo seu ID."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Artista encontrado com sucesso",
                    content = @Content(schema = @Schema(implementation = AdminArtistResponseDTO.class))
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
    ResponseEntity<AdminArtistResponseDTO> findById(Long id);

    @Operation(
            summary = "Criar artista",
            description = "Cria um artista usando nome, bio e URL pública de foto. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Artista criado com sucesso",
                    content = @Content(schema = @Schema(implementation = AdminArtistResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — nome ausente ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem criar artistas",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<AdminArtistResponseDTO> create(ArtistRequestDTO request);

    @Operation(
            summary = "Excluir artista",
            description = "Remove um artista quando não houver músicas, gêneros ou outros vínculos associados. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Artista excluído com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem excluir artistas",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Artista não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflito — não foi possível excluir devido a vínculos existentes no banco",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> delete(Long id);
}