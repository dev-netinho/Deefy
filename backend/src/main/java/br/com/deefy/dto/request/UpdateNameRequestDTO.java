package br.com.deefy.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateNameRequestDTO(
        @NotBlank(message = "O nome não pode estar vazio")
        String nome
) {
}