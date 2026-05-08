package br.com.deefy.service;

import br.com.deefy.model.Playlist;
import java.util.List;

public interface PlaylistService {
    Playlist create(Playlist playlist, Long ownerId);
    List<Playlist> findAllByOwner(Long ownerId);
    Playlist findById(Long id, Long ownerId);
    Playlist updateName(Long id, String newName, Long ownerId);
    void delete(Long id, Long ownerId);
    Playlist addMusicToPlaylist(Long playlistId, Long musicId, Long ownerId);
    Playlist removeMusicFromPlaylist(Long playlistId, Long musicId, Long ownerId);
}