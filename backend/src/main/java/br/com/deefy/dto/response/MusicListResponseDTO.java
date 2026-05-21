package br.com.deefy.dto.response;

public record MusicListResponseDTO(
        Long id,
        String title,
        String artist,
        String album,
        Integer durationSeconds,
        String duration,
        String coverUrl,
        String previewUrl,
        String fileUrl
) {
}
