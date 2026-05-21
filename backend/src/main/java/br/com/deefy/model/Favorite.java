package br.com.deefy.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorito")
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "musica_id", nullable = false)
    private Music musica;

    @Column(name = "datafavoritado", nullable = false)
    private LocalDateTime favoritadoEm;

    protected Favorite() {
    }

    public Favorite(User usuario, Music musica) {
        this.usuario = usuario;
        this.musica = musica;
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

    public Music getMusica() {
        return musica;
    }

    public LocalDateTime getFavoritadoEm() {
        return favoritadoEm;
    }
}
