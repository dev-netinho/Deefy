package br.com.deefy.repository;

import br.com.deefy.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    // Busca as playlists filtrando pelo ID do usuário
    List<Playlist> findByOwnerId(Long ownerId);

    @Query("""
            select p from Playlist p
            where p.owner.id = :ownerId
              and not (p.publica = true and lower(p.owner.email) = lower(:globalOwnerEmail))
            """)
    List<Playlist> findPersonalByOwnerIdExcludingGlobalOwner(
            @Param("ownerId") Long ownerId,
            @Param("globalOwnerEmail") String globalOwnerEmail
    );

    @Query("""
            select p from Playlist p
            where p.publica = true
              and lower(p.owner.email) = lower(:globalOwnerEmail)
            order by p.dataCriacao desc
            """)
    List<Playlist> findGlobalPlaylists(@Param("globalOwnerEmail") String globalOwnerEmail);
}
