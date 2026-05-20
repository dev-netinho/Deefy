package br.com.deefy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequestDTO(
        @NotBlank(message = "O token é obrigatório")
        String token,

        @NotBlank(message = "A nova senha é obrigatória")
        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        String novaSenha
) {}