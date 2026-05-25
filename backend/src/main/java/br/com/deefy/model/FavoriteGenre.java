package br.com.deefy.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorito_genero")
public class FavoriteGenre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "genero_id", nullable = false)
    private Genre genero;

    @Column(name = "datafavoritado", nullable = false)
    private LocalDateTime favoritadoEm;

    protected FavoriteGenre() {
    }

    public FavoriteGenre(User usuario, Genre genero) {
        this.usuario = usuario;
        this.genero = genero;
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

    public Genre getGenero() {
        return genero;
    }

    public LocalDateTime getFavoritadoEm() {
        return favoritadoEm;
    }
}
