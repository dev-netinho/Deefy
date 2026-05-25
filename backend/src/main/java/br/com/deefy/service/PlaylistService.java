package br.com.deefy.service;

import br.com.deefy.dto.request.PlaylistRequestDTO;
import br.com.deefy.model.Playlist;
import java.util.List;

public interface PlaylistService {
    Playlist createPlaylist(Playlist playlist, Long ownerId);
    List<Playlist> findAllByOwner(Long ownerId);
    List<Playlist> findGlobalPlaylists();
    Playlist findById(Long id, Long ownerId);
    Playlist findAccessibleById(Long id, Long ownerId);
    Playlist updateName(Long id, PlaylistRequestDTO request, Long ownerId);
    void deletePlaylist(Long id, Long ownerId);
    Playlist addMusicToPlaylist(Long playlistId, Long musicId, Long ownerId);
    Playlist removeMusicFromPlaylist(Long playlistId, Long musicId, Long ownerId);
}
