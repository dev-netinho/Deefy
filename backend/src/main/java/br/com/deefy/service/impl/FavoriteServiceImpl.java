package br.com.deefy.service.impl;

import br.com.deefy.dto.response.*;
import br.com.deefy.exception.ArtistNotFoundException;
import br.com.deefy.exception.GenreNotFoundException;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.exception.UsuarioNaoEncontradoException;
import br.com.deefy.mapper.MusicMapper;
import br.com.deefy.model.*;
import br.com.deefy.repository.*;
import br.com.deefy.service.FavoriteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    private static final String TIPO_MUSICA = "music";
    private static final String TIPO_ARTISTA = "artist";
    private static final String TIPO_GENERO = "genre";

    private final FavoriteRepository favoriteRepository;
    private final FavoriteArtistRepository favoriteArtistRepository;
    private final FavoriteGenreRepository favoriteGenreRepository;
    private final UserRepository userRepository;
    private final MusicRepository musicRepository;
    private final ArtistRepository artistRepository;
    private final GenreRepository genreRepository;
    private final MusicMapper musicMapper;

    public FavoriteServiceImpl(
            FavoriteRepository favoriteRepository,
            FavoriteArtistRepository favoriteArtistRepository,
            FavoriteGenreRepository favoriteGenreRepository,
            UserRepository userRepository,
            MusicRepository musicRepository,
            ArtistRepository artistRepository,
            GenreRepository genreRepository,
            MusicMapper musicMapper
    ) {
        this.favoriteRepository = favoriteRepository;
        this.favoriteArtistRepository = favoriteArtistRepository;
        this.favoriteGenreRepository = favoriteGenreRepository;
        this.userRepository = userRepository;
        this.musicRepository = musicRepository;
        this.artistRepository = artistRepository;
        this.genreRepository = genreRepository;
        this.musicMapper = musicMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteMusicResponseDTO> listarMusicasFavoritas(Long userId) {
        verificarUsuarioExiste(userId);
        return favoriteRepository.findByUsuarioIdOrderByFavoritadoEmDesc(userId)
                .stream()
                .map(this::converterMusicaParaDTO)
                .toList();
    }

    @Override
    @Transactional
    public FavoriteMusicResponseDTO favoritarMusica(Long userId, Long musicId) {
        User usuario = buscarUsuario(userId);
        Music musica = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException(musicId));

        Favorite favorito = favoriteRepository.findByUsuarioIdAndMusicaId(userId, musicId)
                .orElseGet(() -> favoriteRepository.save(new Favorite(usuario, musica)));

        return converterMusicaParaDTO(favorito);
    }

    @Override
    @Transactional
    public void desfavoritarMusica(Long userId, Long musicId) {
        verificarUsuarioExiste(userId);
        verificarMusicaExiste(musicId);
        favoriteRepository.findByUsuarioIdAndMusicaId(userId, musicId)
                .ifPresent(favoriteRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public FavoriteStatusResponseDTO buscarStatusFavoritoMusica(Long userId, Long musicId) {
        verificarUsuarioExiste(userId);
        verificarMusicaExiste(musicId);
        return new FavoriteStatusResponseDTO(
                musicId,
                TIPO_MUSICA,
                favoriteRepository.existsByUsuarioIdAndMusicaId(userId, musicId)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteArtistResponseDTO> listarArtistasFavoritos(Long userId) {
        verificarUsuarioExiste(userId);
        return favoriteArtistRepository.findByUsuarioIdOrderByFavoritadoEmDesc(userId)
                .stream()
                .map(this::converterArtistaParaDTO)
                .toList();
    }

    @Override
    @Transactional
    public FavoriteArtistResponseDTO favoritarArtista(Long userId, Long artistId) {
        User usuario = buscarUsuario(userId);
        Artist artista = artistRepository.findById(artistId)
                .orElseThrow(() -> new ArtistNotFoundException(artistId));

        FavoriteArtist favorito = favoriteArtistRepository.findByUsuarioIdAndArtistaId(userId, artistId)
                .orElseGet(() -> favoriteArtistRepository.save(new FavoriteArtist(usuario, artista)));

        return converterArtistaParaDTO(favorito);
    }

    @Override
    @Transactional
    public void desfavoritarArtista(Long userId, Long artistId) {
        verificarUsuarioExiste(userId);
        verificarArtistaExiste(artistId);
        favoriteArtistRepository.findByUsuarioIdAndArtistaId(userId, artistId)
                .ifPresent(favoriteArtistRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public FavoriteStatusResponseDTO buscarStatusFavoritoArtista(Long userId, Long artistId) {
        verificarUsuarioExiste(userId);
        verificarArtistaExiste(artistId);
        return new FavoriteStatusResponseDTO(
                artistId,
                TIPO_ARTISTA,
                favoriteArtistRepository.existsByUsuarioIdAndArtistaId(userId, artistId)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteGenreResponseDTO> listarGenerosFavoritos(Long userId) {
        verificarUsuarioExiste(userId);
        return favoriteGenreRepository.findByUsuarioIdOrderByFavoritadoEmDesc(userId)
                .stream()
                .map(this::converterGeneroParaDTO)
                .toList();
    }

    @Override
    @Transactional
    public FavoriteGenreResponseDTO favoritarGenero(Long userId, Long genreId) {
        User usuario = buscarUsuario(userId);
        Genre genero = genreRepository.findById(genreId)
                .orElseThrow(() -> new GenreNotFoundException(genreId));

        FavoriteGenre favorito = favoriteGenreRepository.findByUsuarioIdAndGeneroId(userId, genreId)
                .orElseGet(() -> favoriteGenreRepository.save(new FavoriteGenre(usuario, genero)));

        return converterGeneroParaDTO(favorito);
    }

    @Override
    @Transactional
    public void desfavoritarGenero(Long userId, Long genreId) {
        verificarUsuarioExiste(userId);
        verificarGeneroExiste(genreId);
        favoriteGenreRepository.findByUsuarioIdAndGeneroId(userId, genreId)
                .ifPresent(favoriteGenreRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public FavoriteStatusResponseDTO buscarStatusFavoritoGenero(Long userId, Long genreId) {
        verificarUsuarioExiste(userId);
        verificarGeneroExiste(genreId);
        return new FavoriteStatusResponseDTO(
                genreId,
                TIPO_GENERO,
                favoriteGenreRepository.existsByUsuarioIdAndGeneroId(userId, genreId)
        );
    }

    private FavoriteMusicResponseDTO converterMusicaParaDTO(Favorite favorito) {
        return new FavoriteMusicResponseDTO(
                favorito.getId(),
                favorito.getFavoritadoEm(),
                musicMapper.toListDTO(favorito.getMusica())
        );
    }

    private FavoriteArtistResponseDTO converterArtistaParaDTO(FavoriteArtist favorito) {
        Artist artista = favorito.getArtista();
        return new FavoriteArtistResponseDTO(
                favorito.getId(),
                favorito.getFavoritadoEm(),
                new ArtistaResponseDTO(
                        artista.getId(),
                        artista.getNome(),
                        artista.getBio(),
                        artista.getFotoUrl()
                )
        );
    }

    private FavoriteGenreResponseDTO converterGeneroParaDTO(FavoriteGenre favorito) {
        Genre genero = favorito.getGenero();
        Artist artista = genero.getArtista();
        return new FavoriteGenreResponseDTO(
                favorito.getId(),
                favorito.getFavoritadoEm(),
                new GenreResponseDTO(
                        genero.getId(),
                        genero.getTitulo(),
                        genero.getCapaUrl(),
                        genero.getDataLancamento(),
                        artista == null ? null : artista.getId(),
                        artista == null ? null : artista.getNome()
                )
        );
    }

    private User buscarUsuario(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado"));
    }

    private void verificarUsuarioExiste(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UsuarioNaoEncontradoException("Usuário não encontrado");
        }
    }

    private void verificarMusicaExiste(Long musicId) {
        if (!musicRepository.existsById(musicId)) {
            throw new MusicNotFoundException(musicId);
        }
    }

    private void verificarArtistaExiste(Long artistId) {
        if (!artistRepository.existsById(artistId)) {
            throw new ArtistNotFoundException(artistId);
        }
    }

    private void verificarGeneroExiste(Long genreId) {
        if (!genreRepository.existsById(genreId)) {
            throw new GenreNotFoundException(genreId);
        }
    }
}
