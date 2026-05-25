package br.com.deefy.dto.response;

import java.time.LocalDate;

public record AdminGenreResponseDTO(
        Long id,
        String name,
        String title,
        String titulo,
        String coverUrl,
        String capaUrl,
        LocalDate releaseDate,
        LocalDate dataLancamento,
        Long artistId,
        Long artistaId,
        String artistName,
        String nomeArtista
) {
}
