package br.com.deefy.service;

import br.com.deefy.dto.response.MusicDetailResponseDTO;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.mapper.MusicMapper;
import br.com.deefy.model.Music;
import br.com.deefy.repository.ArtistRepository;
import br.com.deefy.repository.MusicRepository;
import br.com.deefy.service.impl.MusicServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class MusicServiceTest {

    @Mock
    private MusicRepository musicRepository;

    @Mock
    private MusicMapper musicMapper;

    @Mock
    private ArtistRepository artistRepository;

    @InjectMocks
    private MusicServiceImpl musicService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldReturnMusicDetailsWhenIdExists(){
        Music music = new Music();
        MusicDetailResponseDTO dto = new MusicDetailResponseDTO(
                1L,
                "Hotel California",
                null,
                null,
                "Rock",
                405,
                "https://cover.url",
                "https://preview.url",
                "https://file.url",
                null
        );

        when(musicRepository.findById(1L)).thenReturn(Optional.of(music));
        when(musicMapper.toDetailDTO(music)).thenReturn(dto);

        MusicDetailResponseDTO result = musicService.findMusicById(1L);

        assertNotNull(result);
        assertEquals("Hotel California", result.title());
        verify(musicRepository).findById(1L);

    }

    @Test
    void shouldThrowExceptionWhenMusicNotFound() {
        when(musicRepository.findById(99L)).thenReturn(Optional.empty());

        MusicNotFoundException ex = assertThrows(
                MusicNotFoundException.class,
                () -> musicService.findMusicById(99L)
        );

        assertTrue(ex.getMessage().contains("99"));
        verify(musicRepository).findById(99L);
    }

}
