package br.com.deefy.dto.request;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

public record UpdateProfilePhotoRequestDTO(
        @NotBlank(message = "A URL da foto de perfil é obrigatória")
        @URL(message = "A URL da foto de perfil deve ser válida")
        String fotoPerfilUrl
) {
}
