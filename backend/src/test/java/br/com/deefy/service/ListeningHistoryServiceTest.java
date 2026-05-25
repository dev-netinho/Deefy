package br.com.deefy.service;

import br.com.deefy.dto.request.ListeningHistoryRequest;
import br.com.deefy.dto.request.ListeningHistoryResponse;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.exception.UsuarioNaoEncontradoException;
import br.com.deefy.mapper.ListeningHistoryMapper;
import br.com.deefy.model.ListeningHistory;
import br.com.deefy.model.Music;
import br.com.deefy.model.User;
import br.com.deefy.repository.ListeningHistoryRepository;
import br.com.deefy.repository.MusicRepository;
import br.com.deefy.repository.UserRepository;
import br.com.deefy.service.impl.AuthenticatedUserService;
import br.com.deefy.service.impl.ListeningHistoryServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ListeningHistoryServiceTest {

    @Mock
    private AuthenticatedUserService authenticatedUserService;

    @Mock
    private ListeningHistoryRepository listeningHistoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MusicRepository musicRepository;

    @Mock
    private ListeningHistoryMapper listeningHistoryMapper;

    @InjectMocks
    private ListeningHistoryServiceImpl listeningHistoryService;

    private User user;
    private Music music;
    private ListeningHistory listeningHistory;
    private ListeningHistoryRequest request;
    private ListeningHistoryResponse response;

    @Test
    void saveListeningHistory_Success() {
        ListeningHistoryRequest request = new ListeningHistoryRequest(1L);
        User user = new User();
        user.setId(1L);
        Music music = new Music();
        music.setId(1L);
        ListeningHistory history = new ListeningHistory(user, music, LocalDateTime.now());
        ListeningHistoryResponse response = new ListeningHistoryResponse(1L, 1L, 1L, LocalDateTime.now());

        when(authenticatedUserService.getAuthenticatedUser()).thenReturn(user);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(musicRepository.findById(1L)).thenReturn(Optional.of(music));
        when(listeningHistoryMapper.toEntity(request)).thenReturn(history);
        when(listeningHistoryRepository.save(any())).thenReturn(history);
        when(listeningHistoryMapper.toResponse(history)).thenReturn(response);

        ListeningHistoryResponse result = listeningHistoryService.saveListeningHistory(request);

        assertNotNull(result);
        assertEquals(1L, result.id());
        verify(listeningHistoryRepository).save(any());
    }

    @Test
    void saveListeningHistory_UserNotFound_ThrowsException() {
        ListeningHistoryRequest request = new ListeningHistoryRequest(1L);
        User user = new User();
        user.setId(99L);

        when(authenticatedUserService.getAuthenticatedUser()).thenReturn(user);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UsuarioNaoEncontradoException.class,
                () -> listeningHistoryService.saveListeningHistory(request));
    }

    @Test
    void saveListeningHistory_MusicNotFound_ThrowsException() {
        ListeningHistoryRequest request = new ListeningHistoryRequest(99L);
        User user = new User();
        user.setId(1L);

        when(authenticatedUserService.getAuthenticatedUser()).thenReturn(user);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(musicRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(MusicNotFoundException.class,
                () -> listeningHistoryService.saveListeningHistory(request));
    }

    @Test
    void saveListeningHistory_SetsCurrentDateTime() {
        ListeningHistoryRequest request = new ListeningHistoryRequest(1L);
        User user = new User();
        user.setId(1L);
        Music music = new Music();
        music.setId(1L);
        ListeningHistory history = new ListeningHistory(user, music, null);
        ListeningHistoryResponse response = new ListeningHistoryResponse(1L, 1L, 1L, LocalDateTime.now());

        when(authenticatedUserService.getAuthenticatedUser()).thenReturn(user);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(musicRepository.findById(1L)).thenReturn(Optional.of(music));
        when(listeningHistoryMapper.toEntity(request)).thenReturn(history);
        when(listeningHistoryRepository.save(any())).thenReturn(history);
        when(listeningHistoryMapper.toResponse(history)).thenReturn(response);

        listeningHistoryService.saveListeningHistory(request);

        ArgumentCaptor<ListeningHistory> captor = ArgumentCaptor.forClass(ListeningHistory.class);
        verify(listeningHistoryRepository).save(captor.capture());
        assertNotNull(captor.getValue().getDataHoraExecucao());
    }

}
