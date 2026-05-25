package br.com.deefy.controller.docs;

import br.com.deefy.dto.request.GenreRequestDTO;
import br.com.deefy.dto.response.AdminGenreResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

@Tag(name = "Genres", description = "Catálogo de gêneros/lançamentos do sistema")
public interface GenreControllerDocs {

    @Operation(
            summary = "Listar gêneros",
            description = "Retorna gêneros paginados para selects e painel admin."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de gêneros retornada com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Page<AdminGenreResponseDTO>> findAll(Pageable pageable);

    @Operation(
            summary = "Buscar gênero por ID",
            description = "Retorna os dados de um gênero específico pelo seu ID."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Gênero encontrado com sucesso",
                    content = @Content(schema = @Schema(implementation = AdminGenreResponseDTO.class))
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
    ResponseEntity<AdminGenreResponseDTO> findById(Long id);

    @Operation(
            summary = "Criar gênero",
            description = "Cria um gênero usando o artista informado ou o primeiro artista existente " +
                    "quando o frontend envia apenas o nome. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Gênero criado com sucesso",
                    content = @Content(schema = @Schema(implementation = AdminGenreResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — nome ausente ou nenhum artista cadastrado no sistema",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem criar gêneros",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Artista não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<AdminGenreResponseDTO> create(GenreRequestDTO request);

    @Operation(
            summary = "Excluir gênero",
            description = "Remove um gênero quando não houver dependências associadas no banco. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Gênero excluído com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem excluir gêneros",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Gênero não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflito — não foi possível excluir devido a dependências existentes no banco",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> delete(Long id);
}