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

@Tag(name = "Albums", description = "Compatibilidade temporária do frontend: álbuns são mapeados para gênero/lançamento")
public interface AlbumControllerDocs {

    @Operation(
            summary = "Listar álbuns compatíveis",
            description = "Retorna registros de gênero no formato esperado pelo frontend de álbuns. " +
                    "Não existe tabela própria de álbuns — os dados são lidos da tabela de gêneros."
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
    ResponseEntity<Page<AdminGenreResponseDTO>> findAll(Pageable pageable);

    @Operation(
            summary = "Criar álbum compatível",
            description = "Salva o registro na tabela de gêneros sem criar uma tabela nova. " +
                    "Utiliza o artista informado ou o primeiro artista existente como fallback. " +
                    "Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Álbum criado com sucesso",
                    content = @Content(schema = @Schema(implementation = AdminGenreResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — título ausente ou nenhum artista cadastrado no sistema",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem criar álbuns",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Artista não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<AdminGenreResponseDTO> create(GenreRequestDTO request);
}