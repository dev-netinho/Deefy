package br.com.deefy.dto.response;

public record MusicDetailsResponseDTO(
        Long id,
        String titulo,
        String genero,
        int duracaoSegundos,
        String previewURL,
        String capaUrl,
        ArtistaResponseDTO artista,
        AlbumResponseDTO album
) {}
