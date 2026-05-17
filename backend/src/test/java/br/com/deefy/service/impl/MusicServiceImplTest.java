package br.com.deefy.service.impl;

import br.com.deefy.dto.request.MusicRequestDTO;
import br.com.deefy.dto.response.MusicDetailResponseDTO;
import br.com.deefy.dto.response.MusicListResponseDTO;
import br.com.deefy.exception.AlbumNotFoundException;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.mapper.MusicMapper;
import br.com.deefy.model.Album;
import br.com.deefy.model.Artist;
import br.com.deefy.model.Music;
import br.com.deefy.repository.AlbumRepository;
import br.com.deefy.repository.MusicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MusicServiceImplTest {

    @Mock
    private MusicRepository musicRepository;

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private MusicMapper musicMapper;

    @InjectMocks
    private MusicServiceImpl musicService;

    private Music music;
    private Album album;
    private Artist artist;
    private MusicRequestDTO musicRequestDTO;
    private MusicDetailResponseDTO musicDetailResponseDTO;
    private MusicListResponseDTO musicListResponseDTO;

    @BeforeEach
    void setUp() {
        artist = new Artist(1L, "Artist Test");
        album = new Album(1L, "Album Test", artist);
        album.setDataLancamento(LocalDate.of(2024, 1, 1));
        album.setCapaUrl("http://example.com/cover.jpg");

        music = new Music(1L, "Test Music", "Rock", 180, album);
        music.setPreviewUrl("http://example.com/preview.mp3");
        music.setCoverUrl("http://example.com/cover.jpg");
        music.setExternalId("deezer123");

        musicRequestDTO = new MusicRequestDTO(
                "Test Music",
                "Rock",
                180,
                "http://example.com/preview.mp3",
                "http://example.com/cover.jpg",
                "deezer123",
                1L
        );

        musicDetailResponseDTO = new MusicDetailResponseDTO(
                1L,
                "Test Music",
                "Artist Test",
                "Album Test",
                "Rock",
                180,
                "http://example.com/cover.jpg",
                "http://example.com/preview.mp3",
                LocalDate.of(2024, 1, 1)
        );

        musicListResponseDTO = new MusicListResponseDTO(
                1L,
                "Test Music",
                "Artist Test",
                "http://example.com/cover.jpg"
        );
    }

    @Test
    void createMusic_Success() {
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
        when(musicMapper.toEntity(musicRequestDTO)).thenReturn(music);
        when(musicRepository.save(any(Music.class))).thenReturn(music);
        when(musicMapper.toDetailDTO(music)).thenReturn(musicDetailResponseDTO);

        MusicDetailResponseDTO result = musicService.createMusic(musicRequestDTO);

        assertNotNull(result);
        assertEquals("Test Music", result.title());
        assertEquals("Artist Test", result.artist());
        verify(albumRepository).findById(1L);
        verify(musicRepository).save(any(Music.class));
    }

    @Test
    void createMusic_AlbumNotFound_ThrowsException() {
        when(albumRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(AlbumNotFoundException.class, () -> musicService.createMusic(musicRequestDTO));
        verify(musicRepository, never()).save(any());
    }

    @Test
    void findMusicById_Success() {
        when(musicRepository.findById(1L)).thenReturn(Optional.of(music));
        when(musicMapper.toDetailDTO(music)).thenReturn(musicDetailResponseDTO);

        MusicDetailResponseDTO result = musicService.findMusicById(1L);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Test Music", result.title());
    }

    @Test
    void findMusicById_NotFound_ThrowsException() {
        when(musicRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(MusicNotFoundException.class, () -> musicService.findMusicById(99L));
    }

    @Test
    void findAllMusic_Success() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<Music> musicPage = new PageImpl<>(List.of(music), pageable, 1);
        when(musicRepository.findAll(pageable)).thenReturn(musicPage);
        when(musicMapper.toListDTO(music)).thenReturn(musicListResponseDTO);

        Page<MusicListResponseDTO> result = musicService.findAllMusic(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Music", result.getContent().get(0).title());
    }

    @Test
    void searchByTitle_Success() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<Music> musicPage = new PageImpl<>(List.of(music), pageable, 1);
        when(musicRepository.findByTitleContainingIgnoreCase("Test", pageable)).thenReturn(musicPage);
        when(musicMapper.toListDTO(music)).thenReturn(musicListResponseDTO);

        Page<MusicListResponseDTO> result = musicService.searchByTitle("Test", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Music", result.getContent().get(0).title());
    }

    @Test
    void searchByArtist_Success() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<Music> musicPage = new PageImpl<>(List.of(music), pageable, 1);
        when(musicRepository.findByArtistName("Artist", pageable)).thenReturn(musicPage);
        when(musicMapper.toListDTO(music)).thenReturn(musicListResponseDTO);

        Page<MusicListResponseDTO> result = musicService.searchByArtist("Artist", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Artist Test", result.getContent().get(0).artist());
    }

    @Test
    void updateMusic_Success() {
        when(musicRepository.findById(1L)).thenReturn(Optional.of(music));
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
        when(musicRepository.save(any(Music.class))).thenReturn(music);
        when(musicMapper.toDetailDTO(music)).thenReturn(musicDetailResponseDTO);

        MusicDetailResponseDTO result = musicService.updateMusic(1L, musicRequestDTO);

        assertNotNull(result);
        verify(musicMapper).updateEntity(eq(musicRequestDTO), eq(music));
        verify(musicRepository).save(music);
    }

    @Test
    void updateMusic_NotFound_ThrowsException() {
        when(musicRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(MusicNotFoundException.class, () -> musicService.updateMusic(99L, musicRequestDTO));
    }

    @Test
    void updateMusic_AlbumNotFound_ThrowsException() {
        when(musicRepository.findById(1L)).thenReturn(Optional.of(music));
        when(albumRepository.findById(99L)).thenReturn(Optional.empty());

        MusicRequestDTO invalidRequest = new MusicRequestDTO(
                "Test", "Rock", 180, null, null, null, 99L
        );
        assertThrows(AlbumNotFoundException.class, () -> musicService.updateMusic(1L, invalidRequest));
    }

    @Test
    void deleteMusic_Success() {
        when(musicRepository.existsById(1L)).thenReturn(true);
        doNothing().when(musicRepository).deleteById(1L);

        assertDoesNotThrow(() -> musicService.deleteMusic(1L));
        verify(musicRepository).deleteById(1L);
    }

    @Test
    void deleteMusic_NotFound_ThrowsException() {
        when(musicRepository.existsById(99L)).thenReturn(false);

        assertThrows(MusicNotFoundException.class, () -> musicService.deleteMusic(99L));
        verify(musicRepository, never()).deleteById(any());
    }
}