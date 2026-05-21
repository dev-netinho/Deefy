package br.com.deefy.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record MusicRequestDTO(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Genre is required")
        @Size(max = 100, message = "Genre must have at most 100 characters")
        String genre,

        @NotNull(message = "Duration is required")
        @Positive(message = "Duration must be positive")
        Integer durationSeconds,

        String previewUrl,

        String coverUrl,

        @JsonAlias({"arquivoUrl", "audioUrl"})
        String fileUrl,

        @NotNull(message = "Album ID is required")
        Long albumId
) {
}
