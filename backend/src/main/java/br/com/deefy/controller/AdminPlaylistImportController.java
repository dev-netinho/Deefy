package br.com.deefy.controller;

import br.com.deefy.config.OpenApiConfig;
import br.com.deefy.dto.request.YoutubeCookiesRequestDTO;
import br.com.deefy.dto.request.YoutubePlaylistImportRequestDTO;
import br.com.deefy.dto.response.YoutubeCookiesStatusResponseDTO;
import br.com.deefy.dto.response.YoutubePlaylistImportJobResponseDTO;
import br.com.deefy.service.YoutubePlaylistImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/playlist-imports")
@Tag(name = "Admin Playlist Import", description = "Importacao administrativa de playlists do YouTube")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class AdminPlaylistImportController {

    private final YoutubePlaylistImportService importService;

    public AdminPlaylistImportController(YoutubePlaylistImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/youtube")
    @Operation(summary = "Importar playlist do YouTube", description = "Dispara a importacao em background sem alterar schema do banco.")
    public ResponseEntity<YoutubePlaylistImportJobResponseDTO> importYoutubePlaylist(
            @Valid @RequestBody YoutubePlaylistImportRequestDTO request) {
        return ResponseEntity.accepted().body(importService.start(request));
    }

    @GetMapping
    @Operation(summary = "Listar jobs de importacao", description = "Retorna os jobs recentes desta instancia da API.")
    public ResponseEntity<List<YoutubePlaylistImportJobResponseDTO>> listJobs() {
        return ResponseEntity.ok(importService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar importacao", description = "Retorna status e ultimas linhas de saida do job.")
    public ResponseEntity<YoutubePlaylistImportJobResponseDTO> findJob(@PathVariable String id) {
        return importService.find(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/youtube-cookies")
    @Operation(summary = "Consultar cookies do YouTube", description = "Retorna apenas status/metadados; nunca retorna o conteudo do secret.")
    public ResponseEntity<YoutubeCookiesStatusResponseDTO> getYoutubeCookiesStatus() {
        return ResponseEntity.ok(importService.cookiesStatus());
    }

    @PutMapping("/youtube-cookies")
    @Operation(summary = "Salvar cookies do YouTube", description = "Salva um cookies.txt em secret local para o yt-dlp usar em importacoes futuras.")
    public ResponseEntity<YoutubeCookiesStatusResponseDTO> saveYoutubeCookies(
            @Valid @RequestBody YoutubeCookiesRequestDTO request) {
        try {
            return ResponseEntity.ok(importService.saveCookies(request.content()));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage(), exception);
        }
    }
}
