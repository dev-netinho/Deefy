package br.com.deefy.controller;

import br.com.deefy.config.OpenApiConfig;
import br.com.deefy.dto.response.*;
import br.com.deefy.exception.UsuarioNaoEncontradoException;
import br.com.deefy.model.User;
import br.com.deefy.repository.UserRepository;
import br.com.deefy.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/favorites")
@Tag(name = "Favorites", description = "Favoritos de musicas, artistas e generos do usuario autenticado")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    public FavoriteController(FavoriteService favoriteService, UserRepository userRepository) {
        this.favoriteService = favoriteService;
        this.userRepository = userRepository;
    }

    @GetMapping("/musics")
    @Operation(summary = "Listar musicas favoritas", description = "Retorna as musicas favoritadas pelo usuario autenticado.")
    public ResponseEntity<List<FavoriteMusicResponseDTO>> listarMusicasFavoritas(@AuthenticationPrincipal Object principal) {
        User usuario = buscarUsuarioAutenticado(principal);
        return ResponseEntity.ok(favoriteService.listarMusicasFavoritas(usuario.getId()));
    }

    @PostMapping("/musics/{musicId}")
    @Operation(summary = "Favoritar musica", description = "Adiciona uma musica aos favoritos do usuario autenticado sem duplicar registros.")
    public ResponseEntity<FavoriteMusicResponseDTO> favoritarMusica(
            @PathVariable Long musicId,
            @AuthenticationPrincipal Object principal
    ) {
        User usuario = buscarUsuarioAutenticado(principal);
        return ResponseEntity.ok(favoriteService.favoritarMusica(usuario.getId(), musicId));
    }

    @DeleteMapping("/musics/{musicId}")
    @Operation(summary = "Remover musica dos favoritos", description = "Remove uma musica dos favoritos do usuario autenticado.")
    public ResponseEntity<Void> desfavoritarMusica(
            @PathVariable Long musicId,
            @AuthenticationPrincipal Object principal
    ) {
        User usuario = buscarUsuarioAutenticado(principal);
        favoriteService.desfavoritarMusica(usuario.getId(), musicId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/musics/{musicId}/status")
    @Operation(summary = "Consultar status de musica favorita", description = "Informa se uma musica ja esta favoritada pelo usuario autenticado.")
    public ResponseEntity<FavoriteStatusResponseDTO> buscarStatusFavoritoMusica(
            @PathVariable Long musicId,
            @AuthenticationPrincipal Object principal
    ) {
        User usuario = buscarUsuarioAutenticado(principal);
        return ResponseEntity.ok(favoriteService.buscarStatusFavoritoMusica(usuario.getId(), musicId));
    }

    @GetMapping("/artists")
    @Operation(summary = "Listar artistas favoritos", description = "Retorna os artistas favoritados pelo usuario autenticado.")
    public ResponseEntity<List<FavoriteArtistResponseDTO>> listarArtistasFavoritos(@AuthenticationPrincipal Object principal) {
        User usuario = buscarUsuarioAutenticado(principal);
        return ResponseEntity.ok(favoriteService.listarArtistasFavoritos(usuario.getId()));
    }

    @PostMapping("/artists/{artistId}")
    @Operation(summary = "Favoritar artista", description = "Adiciona um artista aos favoritos do usuario autenticado sem duplicar registros.")
    public ResponseEntity<FavoriteArtistResponseDTO> favoritarArtista(
            @PathVariable Long artistId,
            @AuthenticationPrincipal Object principal
    ) {
        User usuario = buscarUsuarioAutenticado(principal);
        return ResponseEntity.ok(favoriteService.favoritarArtista(usuario.getId(), artistId));
    }

    @DeleteMapping("/artists/{artistId}")
    @Operation(summary = "Remover artista dos favoritos", description = "Remove um artista dos favoritos do usuario autenticado.")
    public ResponseEntity<Void> desfavoritarArtista(
            @PathVariable Long artistId,
            @AuthenticationPrincipal Object principal
    ) {
        User usuario = buscarUsuarioAutenticado(principal);
        favoriteService.desfavoritarArtista(usuario.getId(), artistId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/artists/{artistId}/status")
    @Operation(summary = "Consultar status de artista favorito", description = "Informa se um artista ja esta favoritado pelo usuario autenticado.")
    public ResponseEntity<FavoriteStatusResponseDTO> buscarStatusFavoritoArtista(
            @PathVariable Long artistId,
            @AuthenticationPrincipal Object principal
    ) {
        User usuario = buscarUsuarioAutenticado(principal);
        return ResponseEntity.ok(favoriteService.buscarStatusFavoritoArtista(usuario.getId(), artistId));
    }

    @GetMapping("/genres")
    @Operation(summary = "Listar generos favoritos", description = "Retorna os generos favoritados pelo usuario autenticado.")
    public ResponseEntity<List<FavoriteGenreResponseDTO>> listarGenerosFavoritos(@AuthenticationPrincipal Object principal) {
        User usuario = buscarUsuarioAutenticado(principal);
        return ResponseEntity.ok(favoriteService.listarGenerosFavoritos(usuario.getId()));
    }

    @PostMapping("/genres/{genreId}")
    @Operation(summary = "Favoritar genero", description = "Adiciona um genero aos favoritos do usuario autenticado sem duplicar registros.")
    public ResponseEntity<FavoriteGenreResponseDTO> favoritarGenero(
            @PathVariable Long genreId,
            @AuthenticationPrincipal Object principal
    ) {
        User usuario = buscarUsuarioAutenticado(principal);
        return ResponseEntity.ok(favoriteService.favoritarGenero(usuario.getId(), genreId));
    }

    @DeleteMapping("/genres/{genreId}")
    @Operation(summary = "Remover genero dos favoritos", description = "Remove um genero dos favoritos do usuario autenticado.")
    public ResponseEntity<Void> desfavoritarGenero(
            @PathVariable Long genreId,
            @AuthenticationPrincipal Object principal
    ) {
        User usuario = buscarUsuarioAutenticado(principal);
        favoriteService.desfavoritarGenero(usuario.getId(), genreId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/genres/{genreId}/status")
    @Operation(summary = "Consultar status de genero favorito", description = "Informa se um genero ja esta favoritado pelo usuario autenticado.")
    public ResponseEntity<FavoriteStatusResponseDTO> buscarStatusFavoritoGenero(
            @PathVariable Long genreId,
            @AuthenticationPrincipal Object principal
    ) {
        User usuario = buscarUsuarioAutenticado(principal);
        return ResponseEntity.ok(favoriteService.buscarStatusFavoritoGenero(usuario.getId(), genreId));
    }

    private User buscarUsuarioAutenticado(Object principal) {
        String email = extrairEmail(principal);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado"));
    }

    private String extrairEmail(Object principal) {
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        return principal.toString();
    }
}
