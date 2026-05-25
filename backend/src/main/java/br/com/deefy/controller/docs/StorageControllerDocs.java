package br.com.deefy.controller.docs;

import br.com.deefy.dto.response.StorageUploadResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Storage", description = "Uploads administrativos para o Supabase Storage")
public interface StorageControllerDocs {

    @Operation(
            summary = "Enviar imagem",
            description = "Faz upload de uma imagem para o bucket público de imagens no Supabase Storage " +
                    "e retorna a URL pública do arquivo. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Imagem enviada com sucesso — URL pública retornada no corpo da resposta",
                    content = @Content(schema = @Schema(implementation = StorageUploadResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Arquivo ausente, vazio ou em formato não suportado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem realizar uploads",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "413",
                    description = "Arquivo excede o tamanho máximo permitido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "Falha na comunicação com o Supabase Storage",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<StorageUploadResponseDTO> uploadImage(MultipartFile file);

    @Operation(
            summary = "Enviar áudio",
            description = "Faz upload de um arquivo de áudio para o bucket público de músicas no Supabase Storage " +
                    "e retorna a URL pública do arquivo. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Áudio enviado com sucesso — URL pública retornada no corpo da resposta",
                    content = @Content(schema = @Schema(implementation = StorageUploadResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Arquivo ausente, vazio ou em formato não suportado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem realizar uploads",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "413",
                    description = "Arquivo excede o tamanho máximo permitido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "502",
                    description = "Falha na comunicação com o Supabase Storage",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<StorageUploadResponseDTO> uploadAudio(MultipartFile file);
}