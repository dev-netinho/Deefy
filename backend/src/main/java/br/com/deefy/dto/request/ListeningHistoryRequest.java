package br.com.deefy.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ListeningHistoryRequest(
        @NotBlank
        Long musicId
) {
}
