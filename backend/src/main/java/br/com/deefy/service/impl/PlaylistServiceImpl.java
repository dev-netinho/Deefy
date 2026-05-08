package br.com.deefy.service.impl;

import br.com.deefy.exception.PlaylistException;
import br.com.deefy.model.Playlist;
import br.com.deefy.model.Music;
import br.com.deefy.model.User;
import br.com.deefy.repository.PlaylistRepository;
import br.com.deefy.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlaylistServiceImpl implements PlaylistService {

    @Autowired
    private PlaylistRepository playlistRepository;

    // Você precisará desses repositories para buscar as entidades antes de associar
    // @Autowired private UserRepository userRepository;
    // @Autowired private MusicRepository musicRepository;

    @Override
    @Transactional
    public Playlist create(Playlist playlist, Long ownerId) {
        // Aqui você buscaria o User no banco e setaria:
        // User owner = userRepository.findById(ownerId).orElseThrow(...);
        // playlist.setOwner(owner);
        // playlist.setDataCriacao(LocalDateTime.now());
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

        // Usando o metodo que você já tem no Model! (Item 12 do Trello)
        if (!playlist.belongsTo(ownerId)) {
            throw new PlaylistException("Acesso negado: Você não é o proprietário desta playlist.");
        }

        return playlist;
    }

    @Override
    @Transactional
    public Playlist updateName(Long id, String newName, Long ownerId) {
        Playlist playlist = findById(id, ownerId);
        playlist.setName(newName);
        return playlistRepository.save(playlist);
    }

    @Override
    @Transactional
    public void delete(Long id, Long ownerId) {
        Playlist playlist = findById(id, ownerId);
        playlistRepository.delete(playlist);
    }

    @Override
    @Transactional
    public Playlist addMusicToPlaylist(Long playlistId, Long musicId, Long ownerId) {
        Playlist playlist = findById(playlistId, ownerId);

        // Usando o metodo que você já tem no Model! (Item 11 do Trello)
        if (playlist.hasTrackWithMusicId(musicId)) {
            throw new PlaylistException("Esta música já está presente na playlist.");
        }

        // Exemplo de como adicionar (supondo que você buscou a música no musicRepository)
        // Music music = musicRepository.findById(musicId).orElseThrow(...);
        // playlist.addTrack(music);

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