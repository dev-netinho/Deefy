package br.com.deefy.controller;

import br.com.deefy.dto.request.MusicRequestDTO;
import br.com.deefy.dto.response.MusicDetailResponseDTO;
import br.com.deefy.dto.response.MusicListResponseDTO;
import br.com.deefy.service.MusicService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1/musics")
public class MusicController {

    private final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    // isso é para o ADMIN
    @PostMapping
    public ResponseEntity<MusicDetailResponseDTO> createMusic(
            @Valid
            @RequestBody MusicRequestDTO requestDTO
    ) {
        MusicDetailResponseDTO music = musicService.createMusic(requestDTO);
        return ResponseEntity.ok().body(music);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<MusicDetailResponseDTO> findMusicById(
            @PathVariable Long id
    ) {
        MusicDetailResponseDTO music = musicService.findMusicById(id);
        return ResponseEntity.ok().body(music);
    }

    @GetMapping
    public ResponseEntity<Page<MusicListResponseDTO>> findAllMusic(
            @PageableDefault(size = 5, sort = "id")
            Pageable pageable
    ) {
        Page<MusicListResponseDTO> musicPage = musicService.findAllMusic(pageable);
        return ResponseEntity.ok().body(musicPage);
    }

    @GetMapping(value = "/search/title")
    public ResponseEntity<Page<MusicListResponseDTO>> searchByTitle(
            @RequestParam String title,
            @PageableDefault(size = 5, sort = "id")
            Pageable pageable
    ) {
        Page<MusicListResponseDTO> musicPage = musicService.searchByTitle(title, pageable);
        return ResponseEntity.ok().body(musicPage);
    }

    @GetMapping(value = "/search/artist")
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
    public ResponseEntity<Void> deleteMusic(
            @PathVariable Long id
    ) {
        musicService.deleteMusic(id);
        return ResponseEntity.noContent().build();
    }
}