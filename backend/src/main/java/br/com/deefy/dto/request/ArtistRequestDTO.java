package br.com.deefy.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ArtistRequestDTO(
        @JsonAlias({"nome", "artisticName"})
        @NotBlank(message = "Nome do artista é obrigatório")
        @Size(max = 100, message = "Nome do artista deve ter no máximo 100 caracteres")
        String name,

        String bio,

        @JsonAlias({"fotoUrl", "photoURL", "imageUrl"})
        String photoUrl
) {
}
