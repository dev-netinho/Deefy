package br.com.deefy.repository;

import br.com.deefy.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    // Busca as playlists filtrando pelo ID do usuário
    List<Playlist> findByOwnerId(Long ownerId);
}