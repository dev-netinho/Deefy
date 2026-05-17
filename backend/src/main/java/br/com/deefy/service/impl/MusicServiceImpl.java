package br.com.deefy.service.impl;

import br.com.deefy.dto.request.MusicRequestDTO;
import br.com.deefy.dto.response.MusicDetailResponseDTO;
import br.com.deefy.dto.response.MusicListResponseDTO;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.exception.AlbumNotFoundException;
import br.com.deefy.mapper.MusicMapper;
import br.com.deefy.model.Album;
import br.com.deefy.model.Music;
import br.com.deefy.repository.AlbumRepository;
import br.com.deefy.repository.MusicRepository;
import br.com.deefy.service.MusicService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class MusicServiceImpl implements MusicService {

    private final MusicRepository musicRepository;
    private final AlbumRepository albumRepository;
    private final MusicMapper musicMapper;

    public MusicServiceImpl(MusicRepository musicRepository, AlbumRepository albumRepository, MusicMapper musicMapper) {
        this.musicRepository = musicRepository;
        this.albumRepository = albumRepository;
        this.musicMapper = musicMapper;
    }

    @Override
    @Transactional
    public MusicDetailResponseDTO createMusic(MusicRequestDTO request) {
        Album album = albumRepository.findById(request.albumId())
                .orElseThrow(() -> new AlbumNotFoundException(request.albumId()));

        Music music = musicMapper.toEntity(request);
        music.setAlbum(album);

        Music savedMusic = musicRepository.save(music);
        return musicMapper.toDetailDTO(savedMusic);
    }

    @Override
    public MusicDetailResponseDTO findMusicById(Long id) {
        Music music = musicRepository.findById(id)
                .orElseThrow(() -> new MusicNotFoundException(id));
        return musicMapper.toDetailDTO(music);
    }

    @Override
    public Page<MusicListResponseDTO> findAllMusic(Pageable pageable) {
        Page<Music> musicPage = musicRepository.findAll(pageable);
        return musicPage.map(musicMapper::toListDTO);
    }

    @Override
    public Page<MusicListResponseDTO> searchByTitle(String title, Pageable pageable) {
        Page<Music> musicPage = musicRepository.findByTitleContainingIgnoreCase(title, pageable);
        return musicPage.map(musicMapper::toListDTO);
    }

    @Override
    public Page<MusicListResponseDTO> searchByArtist(String artistName, Pageable pageable) {
        Page<Music> musicPage = musicRepository.findByArtistName(artistName, pageable);
        return musicPage.map(musicMapper::toListDTO);
    }

    @Override
    @Transactional
    public MusicDetailResponseDTO updateMusic(Long id, MusicRequestDTO request) {
        Music music = musicRepository.findById(id)
                .orElseThrow(() -> new MusicNotFoundException(id));

        Album album = albumRepository.findById(request.albumId())
                .orElseThrow(() -> new AlbumNotFoundException(request.albumId()));

        musicMapper.updateEntity(request, music);
        music.setAlbum(album);

        Music savedMusic = musicRepository.save(music);
        return musicMapper.toDetailDTO(savedMusic);
    }

    @Override
    @Transactional
    public void deleteMusic(Long id) {
        if (!musicRepository.existsById(id)) {
            throw new MusicNotFoundException(id);
        }
        musicRepository.deleteById(id);
    }
}