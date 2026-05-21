package br.com.deefy.dto.response;

import java.time.LocalDateTime;

public record FavoriteArtistResponseDTO(
        Long id,
        LocalDateTime favoritadoEm,
        ArtistaResponseDTO artista
) {
}
