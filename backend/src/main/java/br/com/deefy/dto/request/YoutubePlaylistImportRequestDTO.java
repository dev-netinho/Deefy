package br.com.deefy.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record YoutubePlaylistImportRequestDTO(
        @NotBlank(message = "O link da playlist e obrigatorio")
        String playlistUrl,

        @NotBlank(message = "O genero e obrigatorio")
        @Size(max = 100, message = "O genero deve ter no maximo 100 caracteres")
        String genre,

        @Size(max = 100, message = "O titulo deve ter no maximo 100 caracteres")
        String playlistTitle,

        @Size(max = 100, message = "O artista deve ter no maximo 100 caracteres")
        String artistName,

        @Min(value = 1, message = "O limite minimo e 1")
        @Max(value = 200, message = "O limite maximo e 200")
        Integer limit
) {
}
