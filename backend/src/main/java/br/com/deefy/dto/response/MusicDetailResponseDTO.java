package br.com.deefy.dto.response;

import java.time.LocalDate;

public record MusicDetailResponseDTO(
        Long id,
        String title,
        String artist,
        String album,
        String genre,
        Integer durationSeconds,
        String coverUrl,
        String previewUrl,
        LocalDate dataLancamento
) {
}