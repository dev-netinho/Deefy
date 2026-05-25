package br.com.deefy.dto.response;

import java.time.LocalDate;

public record GenreResponseDTO(
        Long id,
        String titulo,
        String capaUrl,
        LocalDate dataLancamento,
        Long artistaId,
        String nomeArtista
) {
}
