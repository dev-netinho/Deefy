package br.com.deefy.dto.request;

import java.time.LocalDateTime;

public record ListeningHistoryResponse(
        Long id,
        Long userId,
        Long musicId,
        LocalDateTime dataHoraExecucao
) {
}
