package br.com.deefy.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorito_artista")
public class FavoriteArtist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artista_id", nullable = false)
    private Artist artista;

    @Column(name = "datafavoritado", nullable = false)
    private LocalDateTime favoritadoEm;

    protected FavoriteArtist() {
    }

    public FavoriteArtist(User usuario, Artist artista) {
        this.usuario = usuario;
        this.artista = artista;
    }

    @PrePersist
    void prePersist() {
        if (favoritadoEm == null) {
            favoritadoEm = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public User getUsuario() {
        return usuario;
    }

    public Artist getArtista() {
        return artista;
    }

    public LocalDateTime getFavoritadoEm() {
        return favoritadoEm;
    }
}
