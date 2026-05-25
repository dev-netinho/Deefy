package br.com.deefy.repository;

import br.com.deefy.model.Music;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MusicRepository extends JpaRepository<Music, Long> {

    @Override
    @EntityGraph(attributePaths = "artist")
    Page<Music> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "artist")
    Optional<Music> findWithArtistById(Long id);

    @EntityGraph(attributePaths = "artist")
    Page<Music> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @EntityGraph(attributePaths = "artist")
    @Query("SELECT m FROM Music m JOIN m.artist a WHERE LOWER(a.nome) LIKE LOWER(CONCAT('%', :artistName, '%'))")
    Page<Music> findByArtistName(@Param("artistName") String artistName, Pageable pageable);

    @EntityGraph(attributePaths = "artist")
    Page<Music> findByGenreContainingIgnoreCase(String genre, Pageable pageable);
}
