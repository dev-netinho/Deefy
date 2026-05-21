package br.com.deefy.dto.response;

import java.time.LocalDateTime;

public record FavoriteGenreResponseDTO(
        Long id,
        LocalDateTime favoritadoEm,
        GenreResponseDTO genero
) {
}
