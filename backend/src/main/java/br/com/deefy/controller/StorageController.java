package br.com.deefy.controller;

import br.com.deefy.config.OpenApiConfig;
import br.com.deefy.dto.response.StorageUploadResponseDTO;
import br.com.deefy.service.CatalogStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/storage")
@Tag(name = "Storage", description = "Uploads autenticados para imagens e uploads administrativos para audios")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class StorageController {

    private final CatalogStorageService catalogStorageService;

    public StorageController(CatalogStorageService catalogStorageService) {
        this.catalogStorageService = catalogStorageService;
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Enviar imagem", description = "Faz upload de imagem para o bucket publico de imagens e retorna a URL.")
    public ResponseEntity<StorageUploadResponseDTO> uploadImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(new StorageUploadResponseDTO(catalogStorageService.uploadImage(file)));
    }

    @PostMapping(value = "/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Enviar audio", description = "Faz upload administrativo de audio para o bucket publico de musicas e retorna a URL.")
    public ResponseEntity<StorageUploadResponseDTO> uploadAudio(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(new StorageUploadResponseDTO(catalogStorageService.uploadAudio(file)));
    }
}
