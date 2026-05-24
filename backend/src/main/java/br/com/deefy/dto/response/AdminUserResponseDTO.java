package br.com.deefy.dto.response;

import java.time.LocalDateTime;

public record AdminUserResponseDTO(
        Long id,
        String name,
        String nome,
        String email,
        String username,
        String role,
        String photoUrl,
        String fotoPerfilUrl,
        LocalDateTime createdAt,
        boolean banned,
        boolean deleted,
        boolean online,
        String status
) {
}
