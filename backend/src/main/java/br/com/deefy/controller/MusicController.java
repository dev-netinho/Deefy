package br.com.deefy.controller;


import br.com.deefy.dto.response.MusicDetailsResponseDTO;
import br.com.deefy.service.MusicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/musics")
public class MusicController {

    private final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<MusicDetailsResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(musicService.findById(id));
    }
}
