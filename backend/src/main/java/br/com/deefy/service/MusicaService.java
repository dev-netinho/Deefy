package br.com.deefy.service;

import br.com.deefy.dto.response.DetalhesMusicaResponseDTO;

public interface MusicaService {
    DetalhesMusicaResponseDTO buscarDetalhesID (Long id);
}
