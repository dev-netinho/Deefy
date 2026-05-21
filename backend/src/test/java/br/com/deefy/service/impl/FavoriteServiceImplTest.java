package br.com.deefy.service.impl;

import br.com.deefy.dto.response.MusicListResponseDTO;
import br.com.deefy.exception.ArtistNotFoundException;
import br.com.deefy.exception.GenreNotFoundException;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.mapper.MusicMapper;
import br.com.deefy.model.*;
import br.com.deefy.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceImplTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private FavoriteArtistRepository favoriteArtistRepository;

    @Mock
    private FavoriteGenreRepository favoriteGenreRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MusicRepository musicRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private GenreRepository genreRepository;

    @Mock
    private MusicMapper musicMapper;

    @InjectMocks
    private FavoriteServiceImpl favoriteService;

    private User usuario;
    private Music musica;
    private Artist artista;
    private Genre genero;

    @BeforeEach
    void setUp() {
        usuario = new User();
        usuario.setId(1L);

        artista = new Artist(2L, "Artist Test");
        genero = new Genre(3L, "Trap", artista);

        musica = new Music(4L, "Music Test", "Trap", 180, null);
        musica.setFileUrl("https://storage.test/music.mp3");
    }

    @Test
    void favoritarMusica_QuandoNaoFavoritada_CriaFavorito() {
        Favorite favorito = new Favorite(usuario, musica);
        MusicListResponseDTO musicaDTO = new MusicListResponseDTO(
                4L,
                "Music Test",
                null,
                null,
                180,
                "3:00",
                null,
                null,
                "https://storage.test/music.mp3"
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(musicRepository.findById(4L)).thenReturn(Optional.of(musica));
        when(favoriteRepository.findByUsuarioIdAndMusicaId(1L, 4L)).thenReturn(Optional.empty());
        when(favoriteRepository.save(any(Favorite.class))).thenReturn(favorito);
        when(musicMapper.toListDTO(musica)).thenReturn(musicaDTO);

        var resultado = favoriteService.favoritarMusica(1L, 4L);

        assertEquals(4L, resultado.musica().id());
        verify(favoriteRepository).save(any(Favorite.class));
    }

    @Test
    void favoritarArtista_QuandoNaoFavoritado_CriaFavorito() {
        FavoriteArtist favorito = new FavoriteArtist(usuario, artista);

        when(userRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(artistRepository.findById(2L)).thenReturn(Optional.of(artista));
        when(favoriteArtistRepository.findByUsuarioIdAndArtistaId(1L, 2L)).thenReturn(Optional.empty());
        when(favoriteArtistRepository.save(any(FavoriteArtist.class))).thenReturn(favorito);

        var resultado = favoriteService.favoritarArtista(1L, 2L);

        assertEquals(2L, resultado.artista().id());
        assertEquals("Artist Test", resultado.artista().nome());
        verify(favoriteArtistRepository).save(any(FavoriteArtist.class));
    }

    @Test
    void favoritarGenero_QuandoNaoFavoritado_CriaFavorito() {
        FavoriteGenre favorito = new FavoriteGenre(usuario, genero);

        when(userRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(genreRepository.findById(3L)).thenReturn(Optional.of(genero));
        when(favoriteGenreRepository.findByUsuarioIdAndGeneroId(1L, 3L)).thenReturn(Optional.empty());
        when(favoriteGenreRepository.save(any(FavoriteGenre.class))).thenReturn(favorito);

        var resultado = favoriteService.favoritarGenero(1L, 3L);

        assertEquals(3L, resultado.genero().id());
        assertEquals("Trap", resultado.genero().titulo());
        assertEquals(2L, resultado.genero().artistaId());
        verify(favoriteGenreRepository).save(any(FavoriteGenre.class));
    }

    @Test
    void favoritarMusica_QuandoMusicaNaoEncontrada_LancaExcecao() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(musicRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(MusicNotFoundException.class, () -> favoriteService.favoritarMusica(1L, 99L));
    }

    @Test
    void favoritarArtista_QuandoArtistaNaoEncontrado_LancaExcecao() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(artistRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ArtistNotFoundException.class, () -> favoriteService.favoritarArtista(1L, 99L));
    }

    @Test
    void favoritarGenero_QuandoGeneroNaoEncontrado_LancaExcecao() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(genreRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(GenreNotFoundException.class, () -> favoriteService.favoritarGenero(1L, 99L));
    }
}
