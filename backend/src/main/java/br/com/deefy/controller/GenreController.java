package br.com.deefy.controller;

import br.com.deefy.config.OpenApiConfig;
import br.com.deefy.controller.docs.GenreControllerDocs;
import br.com.deefy.dto.request.GenreRequestDTO;
import br.com.deefy.dto.response.AdminGenreResponseDTO;
import br.com.deefy.exception.ArtistNotFoundException;
import br.com.deefy.exception.GenreNotFoundException;
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
@RequestMapping("/api/v1/genres")
@Tag(name = "Genres", description = "Catalogo de generos/lancamentos conforme contrato atual do banco")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class GenreController implements GenreControllerDocs {

    private final GenreRepository genreRepository;
    private final ArtistRepository artistRepository;

    public GenreController(GenreRepository genreRepository, ArtistRepository artistRepository) {
        this.genreRepository = genreRepository;
        this.artistRepository = artistRepository;
    }

    @GetMapping
    @Operation(summary = "Listar generos", description = "Retorna generos paginados para selects e painel admin.")
    public ResponseEntity<Page<AdminGenreResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {
        return ResponseEntity.ok(genreRepository.findAll(pageable).map(this::toDTO));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar genero por ID")
    public ResponseEntity<AdminGenreResponseDTO> findById(@PathVariable Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new GenreNotFoundException(id));
        return ResponseEntity.ok(toDTO(genre));
    }

    @PostMapping
    @Operation(summary = "Criar genero", description = "Cria genero usando o artista informado ou o primeiro artista existente quando o frontend envia apenas o nome.")
    public ResponseEntity<AdminGenreResponseDTO> create(@RequestBody GenreRequestDTO request) {
        String name = request.name() == null ? "" : request.name().trim();
        if (name.isBlank()) {
            throw new IllegalArgumentException("Nome do gênero é obrigatório.");
        }

        Artist artist = resolveArtist(request.artistId());

        Genre genre = new Genre(null, name, artist);
        genre.setCapaUrl(blankToNull(request.coverUrl()));
        genre.setDataLancamento(request.releaseDate());

        return ResponseEntity.ok(toDTO(genreRepository.save(genre)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir genero", description = "Remove genero quando nao houver dependencias no banco.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!genreRepository.existsById(id)) {
            throw new GenreNotFoundException(id);
        }

        genreRepository.deleteById(id);
        return ResponseEntity.noContent().build();
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
                        "Crie pelo menos um artista antes de cadastrar gêneros no painel admin."
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
