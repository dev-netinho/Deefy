package br.com.deefy.dto.response;

public record FavoriteStatusResponseDTO(
        Long recursoId,
        String tipoRecurso,
        boolean favoritado
) {
}
