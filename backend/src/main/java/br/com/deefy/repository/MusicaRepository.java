package br.com.deefy.repository;

import br.com.deefy.model.Music;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MusicaRepository extends JpaRepository<Music, Long> {

    @Query("SELECT m FROM Music m LEFT JOIN FETCH m.album a LEFT JOIN FETCH a.artist WHERE m.id= :id")
    Optional<Music> buscaPorIdComALbumEArtista(Long id);

}
