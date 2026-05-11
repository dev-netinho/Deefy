package br.com.deefy.controller;


import br.com.deefy.dto.response.DetalhesMusicaResponseDTO;
import br.com.deefy.service.MusicaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/musics")
public class MusicaController {

    private final MusicaService musicaService;

    public MusicaController(MusicaService musicaService) {
        this.musicaService = musicaService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhesMusicaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(musicaService.buscarDetalhesID(id));
    }
}
