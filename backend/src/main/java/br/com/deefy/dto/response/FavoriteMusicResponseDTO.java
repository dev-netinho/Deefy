package br.com.deefy.dto.response;

import java.time.LocalDateTime;

public record FavoriteMusicResponseDTO(
        Long id,
        LocalDateTime favoritadoEm,
        MusicListResponseDTO musica
) {
}
