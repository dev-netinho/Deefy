package br.com.deefy.dto.response;

import java.time.LocalDate;

public record AlbumResponseDTO (
    Long id,
    String titulo,
    String capaUrl,
    LocalDate dataLancamento
){}
