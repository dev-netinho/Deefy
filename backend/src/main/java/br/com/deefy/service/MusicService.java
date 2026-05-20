package br.com.deefy.service;

import br.com.deefy.dto.request.MusicRequestDTO;
import br.com.deefy.dto.response.MusicDetailResponseDTO;
import br.com.deefy.dto.response.MusicListResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MusicService {
    MusicDetailResponseDTO createMusic(MusicRequestDTO request);

    MusicDetailResponseDTO findMusicById(Long id);

    Page<MusicListResponseDTO> findAllMusic(Pageable pageable);

    Page<MusicListResponseDTO> searchByTitle(String title, Pageable pageable);

    Page<MusicListResponseDTO> searchByArtist(String artistName, Pageable pageable);

    MusicDetailResponseDTO updateMusic(Long id, MusicRequestDTO request);

    void deleteMusic(Long id);
}