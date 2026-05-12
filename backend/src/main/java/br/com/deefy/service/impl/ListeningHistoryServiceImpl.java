package br.com.deefy.service.impl;

import br.com.deefy.dto.request.ListeningHistoryRequest;
import br.com.deefy.dto.request.ListeningHistoryResponse;
import br.com.deefy.exception.HistoryNotFoundException;
import br.com.deefy.exception.UsuarioNaoEncontradoException;
import br.com.deefy.mapper.ListeningHistoryMapper;
import br.com.deefy.model.ListeningHistory;
import br.com.deefy.model.Music;
import br.com.deefy.model.User;
import br.com.deefy.repository.ListeningHistoryRepository;
import br.com.deefy.repository.UserRepository;
import br.com.deefy.service.ListeningHistoryService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ListeningHistoryServiceImpl implements ListeningHistoryService {

    private final ListeningHistoryRepository listeningHistoryRepository;
    private final UserRepository userRepository;
    private final MusicRepository musicRepository;
    private final ListeningHistoryMapper listeningHistoryMapper;

    public ListeningHistoryServiceImpl(ListeningHistoryRepository listeningHistoryRepository, UserRepository userRepository, MusicRepository musicRepository, ListeningHistoryMapper listeningHistoryMapper) {
        this.listeningHistoryRepository = listeningHistoryRepository;
        this.userRepository = userRepository;
        this.musicRepository = musicRepository;
        this.listeningHistoryMapper = listeningHistoryMapper;
    }

    @Override
    public ListeningHistoryResponse saveListeningHistory(ListeningHistoryRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new UsuarioNaoEncontradoException("User not found with id: " + request.userId()));

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
    public List<ListeningHistoryResponse> getHistoryByUserId(Long userId) {
        if  (!userRepository.existsById(userId)) {
            throw new UsuarioNaoEncontradoException("User not found with id: " + userId);
        }

        List<ListeningHistory> history = listeningHistoryRepository.findAllByUserIdOrderByDataHoraExecucaoDesc(userId);

        if (history.isEmpty()) {
            throw new HistoryNotFoundException("Listening history not found for user id: " + userId);
        }

        return history.stream()
                .map(listeningHistoryMapper::toResponse)
                .toList();
    }
}