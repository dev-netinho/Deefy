package br.com.deefy.dto.response;

public record MusicListResponseDTO(
        Long id,
        String title,
        String artist,
        String coverUrl
) {
}