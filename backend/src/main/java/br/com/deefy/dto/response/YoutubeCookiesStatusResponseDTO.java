package br.com.deefy.dto.response;

import java.time.Instant;

public record YoutubeCookiesStatusResponseDTO(
        boolean configured,
        String path,
        Long sizeBytes,
        Instant updatedAt
) {
}
