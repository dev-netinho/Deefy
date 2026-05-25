package br.com.deefy.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ActivateAccountRequestDTO(
        @NotBlank(message = "O token de ativação é obrigatório")
        String token
) {}