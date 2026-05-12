package br.com.deefy.service.impl;

import br.com.deefy.dto.response.MusicDetailsResponseDTO;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.mapper.MusicMapper;
import br.com.deefy.model.Music;
import br.com.deefy.repository.MusicRepository;
import br.com.deefy.service.MusicService;
import org.springframework.stereotype.Service;

@Service
public class MusicServiceImpl implements MusicService {

    private final MusicRepository musicRepository;
    private final MusicMapper musicMapper;

    public MusicServiceImpl(MusicRepository musicRepository, MusicMapper musicMapper) {
        this.musicRepository = musicRepository;
        this.musicMapper = musicMapper;
    }

    @Override
    public MusicDetailsResponseDTO findById(Long id) {
        Music musica = musicRepository.findByIdWithAlbumAndArtist(id).orElseThrow(() -> new MusicNotFoundException(id));
        return musicMapper.toDetailsDTO(musica);
    }
}
