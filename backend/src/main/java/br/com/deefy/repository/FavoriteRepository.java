package br.com.deefy.repository;

import br.com.deefy.model.Favorite;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    @EntityGraph(attributePaths = {"musica", "musica.artist"})
    List<Favorite> findByUsuarioIdOrderByFavoritadoEmDesc(Long usuarioId);

    Optional<Favorite> findByUsuarioIdAndMusicaId(Long usuarioId, Long musicaId);

    boolean existsByUsuarioIdAndMusicaId(Long usuarioId, Long musicaId);
}
