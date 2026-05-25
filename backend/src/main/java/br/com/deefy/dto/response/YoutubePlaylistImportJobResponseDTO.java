package br.com.deefy.dto.response;

import java.time.Instant;
import java.util.List;

public record YoutubePlaylistImportJobResponseDTO(
        String id,
        String status,
        String message,
        Instant createdAt,
        Instant finishedAt,
        Integer exitCode,
        List<String> output
) {
}
