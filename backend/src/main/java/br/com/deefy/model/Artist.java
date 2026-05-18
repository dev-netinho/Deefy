package br.com.deefy.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Tabela {@code artista} conforme {@code deefy_schema.sql}.
 */
@Entity
@Table(name = "artista")
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "fotourl", length = 100)
    private String fotoUrl;

    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Album> albums = new ArrayList<>();

    protected Artist() {
    }

    /** Uso em testes (entidade desanexada). */
    public Artist(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }


    public List<Album> getAlbums() {
        return albums;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getBio() {
        return bio;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }
}
