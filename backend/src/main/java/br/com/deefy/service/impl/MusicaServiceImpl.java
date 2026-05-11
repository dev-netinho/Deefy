package br.com.deefy.service.impl;

import br.com.deefy.dto.response.DetalhesMusicaResponseDTO;
import br.com.deefy.exception.MusicaNaoEncontradaException;
import br.com.deefy.mapper.MusicaMapper;
import br.com.deefy.model.Music;
import br.com.deefy.repository.MusicaRepository;
import br.com.deefy.service.MusicaService;
import org.springframework.stereotype.Service;

@Service
public class MusicaServiceImpl implements MusicaService {

    private final MusicaRepository musicaRepository;
    private final MusicaMapper musicaMapper;

    public MusicaServiceImpl(MusicaRepository musicaRepository, MusicaMapper musicaMapper) {
        this.musicaRepository = musicaRepository;
        this.musicaMapper = musicaMapper;
    }

    @Override
    public DetalhesMusicaResponseDTO buscarDetalhesID(Long id) {
        Music musica = musicaRepository.buscaPorIdComALbumEArtista(id).orElseThrow(() -> new MusicaNaoEncontradaException(id));
        return musicaMapper.detalhesDTO(musica);
    }
}
