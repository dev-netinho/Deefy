package br.com.deefy.repository;

import br.com.deefy.model.FavoriteArtist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteArtistRepository extends JpaRepository<FavoriteArtist, Long> {

    List<FavoriteArtist> findByUsuarioIdOrderByFavoritadoEmDesc(Long usuarioId);

    Optional<FavoriteArtist> findByUsuarioIdAndArtistaId(Long usuarioId, Long artistaId);

    boolean existsByUsuarioIdAndArtistaId(Long usuarioId, Long artistaId);
}
