package br.com.deefy.model;

import jakarta.persistence.*;

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

    protected Artist() {
    }

    /** Uso em testes (entidade desanexada). */
    public Artist(Long id, String nome) {
        this.id = id;
        this.nome = nome;
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

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }
}
