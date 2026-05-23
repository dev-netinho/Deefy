package br.com.deefy.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;

import java.time.LocalDate;

public record GenreRequestDTO(
        @JsonAlias({"titulo", "title"})
        String name,

        @JsonAlias({"capaUrl", "coverURL", "imageUrl"})
        String coverUrl,

        @JsonAlias({"dataLancamento", "release_date"})
        LocalDate releaseDate,

        @JsonAlias({"artistaId", "artist_id"})
        Long artistId
) {
}
