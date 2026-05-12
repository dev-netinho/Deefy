package br.com.deefy.service;

import br.com.deefy.dto.response.MusicDetailsResponseDTO;

public interface MusicService {
    MusicDetailsResponseDTO findById(Long id);
}
