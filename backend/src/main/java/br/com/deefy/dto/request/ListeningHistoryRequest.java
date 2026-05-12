package br.com.deefy.dto.request;

public record ListeningHistoryRequest(
        Long userId,
        Long musicId
) {
}
