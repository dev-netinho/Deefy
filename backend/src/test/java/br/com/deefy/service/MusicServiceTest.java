package br.com.deefy.service;

import br.com.deefy.dto.response.MusicDetailsResponseDTO;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.mapper.MusicMapper;
import br.com.deefy.model.Music;
import br.com.deefy.repository.MusicRepository;
import br.com.deefy.service.impl.MusicServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class MusicServiceTest {

    @Mock
    private MusicRepository musicRepository;

    @Mock
    private MusicMapper musicMapper;

    @InjectMocks
    private MusicServiceImpl musicService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldReturnMusicDetailsWhenIdExists(){
        Music music = new Music();
        MusicDetailsResponseDTO dto = new MusicDetailsResponseDTO(1L,"Hotel California","Rock",405,"https://preview.url","https://cover.url",null,null);

        when(musicRepository.findByIdWithAlbumAndArtist(1L)).thenReturn(Optional.of(music));
        when(musicMapper.toDetailsDTO(music)).thenReturn(dto);

        MusicDetailsResponseDTO result = musicService.findById(1L);

        assertNotNull(result);
        assertEquals("Hotel California", result.titulo());
        verify(musicRepository).findByIdWithAlbumAndArtist(1L);

    }

    @Test
    void shouldThrowExceptionWhenMusicNotFound() {

        when(musicRepository.findByIdWithAlbumAndArtist(99L)).thenReturn(Optional.empty());

        MusicNotFoundException ex = assertThrows(
                MusicNotFoundException.class,
                () -> musicService.findById(99L)
        );

        assertTrue(ex.getMessage().contains("99"));
        verify(musicRepository).findByIdWithAlbumAndArtist(99L);
    }

}
