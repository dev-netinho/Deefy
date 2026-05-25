package br.com.deefy.service;

import br.com.deefy.dto.response.*;

import java.util.List;

public interface FavoriteService {

    List<FavoriteMusicResponseDTO> listarMusicasFavoritas(Long userId);

    FavoriteMusicResponseDTO favoritarMusica(Long userId, Long musicId);

    void desfavoritarMusica(Long userId, Long musicId);

    FavoriteStatusResponseDTO buscarStatusFavoritoMusica(Long userId, Long musicId);

    List<FavoriteArtistResponseDTO> listarArtistasFavoritos(Long userId);

    FavoriteArtistResponseDTO favoritarArtista(Long userId, Long artistId);

    void desfavoritarArtista(Long userId, Long artistId);

    FavoriteStatusResponseDTO buscarStatusFavoritoArtista(Long userId, Long artistId);

    List<FavoriteGenreResponseDTO> listarGenerosFavoritos(Long userId);

    FavoriteGenreResponseDTO favoritarGenero(Long userId, Long genreId);

    void desfavoritarGenero(Long userId, Long genreId);

    FavoriteStatusResponseDTO buscarStatusFavoritoGenero(Long userId, Long genreId);
}
