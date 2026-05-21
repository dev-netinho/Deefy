package br.com.deefy.service.impl;

import br.com.deefy.dto.request.PlaylistRequestDTO;
import br.com.deefy.exception.MusicNotFoundException;
import br.com.deefy.exception.PlaylistException;
import br.com.deefy.exception.UsuarioNaoEncontradoException;
import br.com.deefy.model.Music;
import br.com.deefy.model.Playlist;
import br.com.deefy.model.User;
import br.com.deefy.repository.MusicRepository;
import br.com.deefy.repository.PlaylistRepository;
import br.com.deefy.repository.UserRepository;
import br.com.deefy.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlaylistServiceImpl implements PlaylistService {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MusicRepository musicRepository;

    @Override
    @Transactional
    public Playlist createPlaylist(Playlist playlist, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado"));

        playlist.setOwner(owner); // Vincula o dono
        return playlistRepository.save(playlist);
    }

    @Override
    public List<Playlist> findAllByOwner(Long ownerId) {
        // No seu Repository, o metodo deve ser findByOwnerId
        return playlistRepository.findByOwnerId(ownerId);
    }

    @Override
    public Playlist findById(Long id, Long ownerId) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new PlaylistException("Playlist não encontrada com o ID: " + id));

        if (!playlist.belongsTo(ownerId)) {
            throw new PlaylistException("Acesso negado: Você não é o proprietário desta playlist.");
        }

        return playlist;
    }

    @Override
    @Transactional
    public Playlist updateName(Long id, PlaylistRequestDTO request, Long ownerId) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new PlaylistException("Playlist não encontrada"));

        // Validação de Segurança: apenas o dono edita
        if (!playlist.getOwner().getId().equals(ownerId)) {
            throw new PlaylistException("Você não tem permissão para editar esta playlist");
        }

        // Atualiza apenas os campos permitidos
        playlist.setName(request.name());
        playlist.setPublica(request.publica());

        return playlistRepository.save(playlist);
    }

    @Override
    @Transactional
    public void deletePlaylist(Long id, Long ownerId) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new PlaylistException("Playlist não encontrada"));

        // Valida se quem está deletando é realmente o dono
        if (!playlist.getOwner().getId().equals(ownerId)) {
            throw new PlaylistException("Você não tem permissão para deletar esta playlist");
        }

        playlistRepository.delete(playlist);
    }

    @Override
    @Transactional
    public Playlist addMusicToPlaylist(Long playlistId, Long musicId, Long ownerId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new PlaylistException("Playlist não encontrada"));

        // Validação de segurança
        if (!playlist.getOwner().getId().equals(ownerId)) {
            throw new PlaylistException("Apenas o dono pode adicionar músicas a esta playlist");
        }

        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException(musicId));

        // Regra de negócio: evitar duplicatas
        if (playlist.getTracks().contains(music)) {
            throw new PlaylistException("Esta música já está presente na playlist");
        }

        playlist.getTracks().add(music);
        return playlistRepository.save(playlist);
    }

    @Override
    @Transactional
    public Playlist removeMusicFromPlaylist(Long playlistId, Long musicId, Long ownerId) {
        Playlist playlist = findById(playlistId, ownerId);

        // Usando o metodo do Model
        boolean removed = playlist.removeFirstTrackByMusicId(musicId);

        if (!removed) {
            throw new PlaylistException("Música não encontrada na playlist.");
        }

        return playlistRepository.save(playlist);
    }
}