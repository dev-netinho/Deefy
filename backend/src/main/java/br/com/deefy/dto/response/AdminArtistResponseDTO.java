package br.com.deefy.dto.response;

public record AdminArtistResponseDTO(
        Long id,
        String name,
        String nome,
        String bio,
        String photoUrl,
        String fotoUrl
) {
}
