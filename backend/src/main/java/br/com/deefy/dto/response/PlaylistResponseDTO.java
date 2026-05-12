package br.com.deefy.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

public record PlaylistResponseDTO(
        Long id,
        String name,
        boolean publica,
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
        LocalDateTime dataCriacao,
        List<MusicDetailsResponseDTO> tracks
) {}