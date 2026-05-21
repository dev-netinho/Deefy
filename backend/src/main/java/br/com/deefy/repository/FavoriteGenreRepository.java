package br.com.deefy.repository;

import br.com.deefy.model.FavoriteGenre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteGenreRepository extends JpaRepository<FavoriteGenre, Long> {

    List<FavoriteGenre> findByUsuarioIdOrderByFavoritadoEmDesc(Long usuarioId);

    Optional<FavoriteGenre> findByUsuarioIdAndGeneroId(Long usuarioId, Long generoId);

    boolean existsByUsuarioIdAndGeneroId(Long usuarioId, Long generoId);
}
