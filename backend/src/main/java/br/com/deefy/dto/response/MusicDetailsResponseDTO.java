package br.com.deefy.dto.response;

public record MusicDetailsResponseDTO(
        Long id,
        String titulo,
        String genero,
        int duracaoSegundos,
        String previewUrl,
        String capaUrl,
        String arquivoUrl,
        ArtistaResponseDTO artista,
        AlbumResponseDTO album
) {}
