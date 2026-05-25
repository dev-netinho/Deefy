package br.com.deefy.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PlaylistRequestDTO(
        @NotBlank(message = "O nome da playlist é obrigatório")
        String name,
        boolean publica
) {}