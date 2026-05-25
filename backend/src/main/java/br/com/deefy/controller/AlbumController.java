package br.com.deefy.controller;

import br.com.deefy.config.OpenApiConfig;
import br.com.deefy.dto.request.GenreRequestDTO;
import br.com.deefy.dto.response.AdminGenreResponseDTO;
import br.com.deefy.exception.ArtistNotFoundException;
import br.com.deefy.model.Artist;
import br.com.deefy.model.Genre;
import br.com.deefy.repository.ArtistRepository;
import br.com.deefy.repository.GenreRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/albums")
@Tag(name = "Albums compatibility", description = "Compatibilidade temporaria do frontend: albuns sao mapeados para genero/lancamento")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class AlbumController {

    private final GenreRepository genreRepository;
    private final ArtistRepository artistRepository;

    public AlbumController(GenreRepository genreRepository, ArtistRepository artistRepository) {
        this.genreRepository = genreRepository;
        this.artistRepository = artistRepository;
    }

    @GetMapping
    @Operation(summary = "Listar albuns compativeis", description = "Retorna registros de genero no formato esperado pelo frontend de albuns.")
    public ResponseEntity<Page<AdminGenreResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {
        return ResponseEntity.ok(genreRepository.findAll(pageable).map(this::toDTO));
    }

    @PostMapping
    @Operation(summary = "Criar album compativel", description = "Salva o registro na tabela genero, sem criar tabela nova.")
    public ResponseEntity<AdminGenreResponseDTO> create(@RequestBody GenreRequestDTO request) {
        String title = request.name() == null ? "" : request.name().trim();
        if (title.isBlank()) {
            throw new IllegalArgumentException("Título é obrigatório.");
        }

        Artist artist = resolveArtist(request.artistId());
        Genre genre = new Genre(null, title, artist);
        genre.setCapaUrl(blankToNull(request.coverUrl()));
        genre.setDataLancamento(request.releaseDate());

        return ResponseEntity.ok(toDTO(genreRepository.save(genre)));
    }

    private Artist resolveArtist(Long artistId) {
        if (artistId != null) {
            return artistRepository.findById(artistId)
                    .orElseThrow(() -> new ArtistNotFoundException(artistId));
        }

        return artistRepository.findAll(PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Crie pelo menos um artista antes de cadastrar álbuns no painel admin."
                ));
    }

    private AdminGenreResponseDTO toDTO(Genre genre) {
        Artist artist = genre.getArtista();
        Long artistId = artist == null ? null : artist.getId();
        String artistName = artist == null ? null : artist.getNome();
        return new AdminGenreResponseDTO(
                genre.getId(),
                genre.getTitulo(),
                genre.getTitulo(),
                genre.getTitulo(),
                genre.getCapaUrl(),
                genre.getCapaUrl(),
                genre.getDataLancamento(),
                genre.getDataLancamento(),
                artistId,
                artistId,
                artistName,
                artistName
        );
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
