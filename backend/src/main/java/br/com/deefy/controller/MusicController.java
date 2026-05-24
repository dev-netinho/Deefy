package br.com.deefy.controller;

import br.com.deefy.dto.request.MusicRequestDTO;
import br.com.deefy.dto.response.MusicDetailResponseDTO;
import br.com.deefy.dto.response.MusicListResponseDTO;
import br.com.deefy.config.OpenApiConfig;
import br.com.deefy.service.MusicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/musics")
@Tag(name = "Music", description = "Catalogo de musicas e URLs de audio/imagem")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MusicController {

    private final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    // isso é para o ADMIN
    @PostMapping
    @Operation(summary = "Criar musica", description = "Cria uma musica usando metadados e URLs ja publicas do storage.")
    public ResponseEntity<MusicDetailResponseDTO> createMusic(
            @Valid
            @RequestBody MusicRequestDTO requestDTO
    ) {
        MusicDetailResponseDTO music = musicService.createMusic(requestDTO);
        return ResponseEntity.ok().body(music);
    }

    @GetMapping(value = "/{id}")
    @Operation(summary = "Buscar musica por ID", description = "Retorna detalhes de uma musica, incluindo fileUrl para playback.")
    public ResponseEntity<MusicDetailResponseDTO> findMusicById(
            @PathVariable Long id
    ) {
        MusicDetailResponseDTO music = musicService.findMusicById(id);
        return ResponseEntity.ok().body(music);
    }

    @GetMapping
    @Operation(summary = "Listar musicas", description = "Retorna musicas paginadas para home, busca e player.")
    public ResponseEntity<Page<MusicListResponseDTO>> findAllMusic(
            @PageableDefault(size = 5, sort = "id")
            Pageable pageable
    ) {
        Page<MusicListResponseDTO> musicPage = musicService.findAllMusic(pageable);
        return ResponseEntity.ok().body(musicPage);
    }

    @GetMapping(value = "/random")
    @Operation(summary = "Listar musicas aleatorias", description = "Compatibilidade com o frontend: retorna uma lista embaralhada de musicas para a home.")
    public ResponseEntity<List<MusicListResponseDTO>> findRandomMusic(
            @RequestParam(defaultValue = "12") int size
    ) {
        int requestedSize = Math.max(1, Math.min(size, 50));
        int fetchSize = Math.min(requestedSize * 4, 200);
        List<MusicListResponseDTO> musics = new ArrayList<>(
                musicService.findAllMusic(PageRequest.of(0, fetchSize)).getContent()
        );
        Collections.shuffle(musics);
        return ResponseEntity.ok(musics.stream().limit(requestedSize).toList());
    }

    @GetMapping(value = "/search/title")
    @Operation(summary = "Buscar musicas por titulo", description = "Pesquisa paginada por titulo da musica.")
    public ResponseEntity<Page<MusicListResponseDTO>> searchByTitle(
            @RequestParam String title,
            @PageableDefault(size = 5, sort = "id")
            Pageable pageable
    ) {
        Page<MusicListResponseDTO> musicPage = musicService.searchByTitle(title, pageable);
        return ResponseEntity.ok().body(musicPage);
    }

    @GetMapping(value = "/search/artist")
    @Operation(summary = "Buscar musicas por artista", description = "Pesquisa paginada por nome de artista quando os metadados estiverem vinculados.")
    public ResponseEntity<Page<MusicListResponseDTO>> searchByArtist(
            @RequestParam String artist,
            @PageableDefault(size = 5, sort = "id")
            Pageable pageable
    ) {
        Page<MusicListResponseDTO> musicPage = musicService.searchByArtist(artist, pageable);
        return ResponseEntity.ok().body(musicPage);
    }

    // isso é para o ADMIN
    @PutMapping(value = "/{id}")
    @Operation(summary = "Atualizar musica", description = "Atualiza metadados e URLs de uma musica existente.")
    public ResponseEntity<MusicDetailResponseDTO> updateMusic(
            @PathVariable Long id,
            @Valid
            @RequestBody MusicRequestDTO requestDTO
    ) {
        MusicDetailResponseDTO music = musicService.updateMusic(id, requestDTO);
        return ResponseEntity.ok().body(music);
    }

    // isso é para o ADMIN
    @DeleteMapping(value = "/{id}")
    @Operation(summary = "Excluir musica", description = "Remove uma musica do catalogo.")
    public ResponseEntity<Void> deleteMusic(
            @PathVariable Long id
    ) {
        musicService.deleteMusic(id);
        return ResponseEntity.noContent().build();
    }
}
