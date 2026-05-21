package br.com.deefy.dto.response;

public record ArtistaResponseDTO (
    Long id,
    String nome,
    String bio,
    String fotoUrl
) {}
