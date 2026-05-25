package br.com.deefy.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record PlaylistRequestDTO(
        @JsonAlias({"nome"})
        @NotBlank(message = "O nome da playlist é obrigatório")
        String name,
        boolean publica,

        @JsonAlias({"descricao", "bio"})
        String description,

        @JsonAlias({"capaUrl", "imageUrl", "imagemUrl"})
        String coverUrl
) {}
