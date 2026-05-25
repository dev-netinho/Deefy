package br.com.deefy.dto.response;

import java.time.LocalDateTime;

public record UserResponseDTO(
        Long id,
        String nome,
        String email,
        String fotoPerfilUrl,
        LocalDateTime createdAt
) {
}
