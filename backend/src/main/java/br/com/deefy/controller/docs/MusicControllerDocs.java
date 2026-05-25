package br.com.deefy.controller.docs;

import br.com.deefy.dto.request.MusicRequestDTO;
import br.com.deefy.dto.response.MusicDetailResponseDTO;
import br.com.deefy.dto.response.MusicListResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.List;

@Tag(name = "Music", description = "Catálogo de músicas e URLs de áudio/imagem")
public interface MusicControllerDocs {

    @Operation(
            summary = "Criar música",
            description = "Cria uma música usando metadados e URLs já públicas do storage. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Música criada com sucesso",
                    content = @Content(schema = @Schema(implementation = MusicDetailResponseDTO.class))
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
                    description = "Acesso negado — apenas administradores podem criar músicas",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<MusicDetailResponseDTO> createMusic(MusicRequestDTO requestDTO);

    @Operation(
            summary = "Buscar música por ID",
            description = "Retorna os detalhes completos de uma música, incluindo a fileUrl para playback."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Música encontrada com sucesso",
                    content = @Content(schema = @Schema(implementation = MusicDetailResponseDTO.class))
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
    ResponseEntity<MusicDetailResponseDTO> findMusicById(Long id);

    @Operation(
            summary = "Listar músicas",
            description = "Retorna músicas paginadas. Utilizado pela home, busca e player."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de músicas retornada com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Page<MusicListResponseDTO>> findAllMusic(Pageable pageable);

    @Operation(
            summary = "Listar músicas aleatórias",
            description = "Retorna uma lista embaralhada de músicas para a home. " +
                    "O parâmetro 'size' controla a quantidade retornada (mínimo 1, máximo 50)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista aleatória retornada com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<List<MusicListResponseDTO>> findRandomMusic(int size);

    @Operation(
            summary = "Buscar músicas por título",
            description = "Pesquisa paginada de músicas filtrando pelo título."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Resultados da busca retornados com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Parâmetro 'title' ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Page<MusicListResponseDTO>> searchByTitle(String title, Pageable pageable);

    @Operation(
            summary = "Buscar músicas por artista",
            description = "Pesquisa paginada de músicas filtrando pelo nome do artista."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Resultados da busca retornados com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Parâmetro 'artist' ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Page<MusicListResponseDTO>> searchByArtist(String artist, Pageable pageable);

    @Operation(
            summary = "Atualizar música",
            description = "Atualiza metadados e URLs de uma música existente. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Música atualizada com sucesso",
                    content = @Content(schema = @Schema(implementation = MusicDetailResponseDTO.class))
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
                    description = "Acesso negado — apenas administradores podem atualizar músicas",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Música não encontrada para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<MusicDetailResponseDTO> updateMusic(Long id, MusicRequestDTO requestDTO);

    @Operation(
            summary = "Excluir música",
            description = "Remove uma música do catálogo permanentemente. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Música excluída com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem excluir músicas",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Música não encontrada para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> deleteMusic(Long id);
}