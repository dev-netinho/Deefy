package br.com.deefy.service.impl;

import br.com.deefy.dto.request.ListeningHistoryRequest;
import br.com.deefy.dto.request.ListeningHistoryResponse;
import br.com.deefy.exception.HistoryNotFoundException;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.exception.UsuarioNaoEncontradoException;
import br.com.deefy.mapper.ListeningHistoryMapper;
import br.com.deefy.model.ListeningHistory;
import br.com.deefy.model.Music;
import br.com.deefy.model.User;
import br.com.deefy.repository.ListeningHistoryRepository;
import br.com.deefy.repository.MusicRepository;
import br.com.deefy.repository.UserRepository;
import br.com.deefy.service.ListeningHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class ListeningHistoryServiceImpl implements ListeningHistoryService {

    private final AuthenticatedUserService authenticatedUserService;
    private final ListeningHistoryRepository listeningHistoryRepository;
    private final UserRepository userRepository;
    private final MusicRepository musicRepository;
    private final ListeningHistoryMapper listeningHistoryMapper;

    public ListeningHistoryServiceImpl(AuthenticatedUserService authenticatedUserService, ListeningHistoryRepository listeningHistoryRepository, UserRepository userRepository, MusicRepository musicRepository, ListeningHistoryMapper listeningHistoryMapper) {
        this.authenticatedUserService = authenticatedUserService;
        this.listeningHistoryRepository = listeningHistoryRepository;
        this.userRepository = userRepository;
        this.musicRepository = musicRepository;
        this.listeningHistoryMapper = listeningHistoryMapper;
    }

    @Override
    public ListeningHistoryResponse saveListeningHistory(ListeningHistoryRequest request) {
        Long userId = authenticatedUserService.getAuthenticatedUser().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("User not found with id: " + userId));

        Music music = musicRepository.findById(request.musicId())
                .orElseThrow(() -> new MusicNotFoundException(request.musicId()));

        LocalDateTime now = LocalDateTime.now();

        ListeningHistory saved = listeningHistoryMapper.toEntity(request);
        saved.setUser(user);
        saved.setMusic(music);
        saved.setDataHoraExecucao(now);

        ListeningHistory response = listeningHistoryRepository.save(saved);

        return listeningHistoryMapper.toResponse(response);
    }


    @Override
    public Page<ListeningHistoryResponse> getHistoryByUserId(Long userId, Pageable pageable) {
        if  (!userRepository.existsById(userId)) {
            throw new UsuarioNaoEncontradoException("User not found with id: " + userId);
        }

        Page<ListeningHistory> history = listeningHistoryRepository.findAllByUserIdOrderByDataHoraExecucaoDesc(userId, pageable);
        if (history.isEmpty()) {
            throw new HistoryNotFoundException("No listening history found for user with id: " + userId);
        }

        return history.map(listeningHistoryMapper::toResponse);
    }
}
