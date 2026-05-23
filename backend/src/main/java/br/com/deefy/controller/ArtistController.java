package br.com.deefy.controller;

import br.com.deefy.config.OpenApiConfig;
import br.com.deefy.dto.request.ArtistRequestDTO;
import br.com.deefy.dto.response.AdminArtistResponseDTO;
import br.com.deefy.exception.ArtistNotFoundException;
import br.com.deefy.model.Artist;
import br.com.deefy.repository.ArtistRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/artists")
@Tag(name = "Artists", description = "Cadastro e consulta de artistas do catalogo")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ArtistController {

    private final ArtistRepository artistRepository;

    public ArtistController(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    @GetMapping
    @Operation(summary = "Listar artistas", description = "Retorna artistas paginados para catalogo e painel admin.")
    public ResponseEntity<Page<AdminArtistResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {
        return ResponseEntity.ok(artistRepository.findAll(pageable).map(this::toDTO));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar artista por ID")
    public ResponseEntity<AdminArtistResponseDTO> findById(@PathVariable Long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new ArtistNotFoundException(id));
        return ResponseEntity.ok(toDTO(artist));
    }

    @PostMapping
    @Operation(summary = "Criar artista", description = "Cria artista usando nome, bio e URL publica de foto quando enviada.")
    public ResponseEntity<AdminArtistResponseDTO> create(@Valid @RequestBody ArtistRequestDTO request) {
        Artist artist = new Artist(null, request.name().trim());
        artist.setBio(blankToNull(request.bio()));
        artist.setFotoUrl(blankToNull(request.photoUrl()));
        return ResponseEntity.ok(toDTO(artistRepository.save(artist)));
    }

    private AdminArtistResponseDTO toDTO(Artist artist) {
        return new AdminArtistResponseDTO(
                artist.getId(),
                artist.getNome(),
                artist.getNome(),
                artist.getBio(),
                artist.getFotoUrl(),
                artist.getFotoUrl()
        );
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
