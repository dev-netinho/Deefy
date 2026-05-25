package br.com.deefy.dto.request;

import jakarta.validation.constraints.NotBlank;

public record YoutubeCookiesRequestDTO(
        @NotBlank(message = "O conteudo do arquivo cookies.txt e obrigatorio")
        String content
) {
}
