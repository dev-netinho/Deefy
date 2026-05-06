package br.com.deefy.model;

import jakarta.persistence.*;

import java.time.LocalDate;

/**
 * Tabela {@code album} conforme {@code deefy_schema.sql}.
 */
@Entity
@Table(name = "album")
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column(name = "capaurl", length = 100)
    private String capaUrl;

    @Column(name = "datalancamento")
    private LocalDate dataLancamento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artista_id", nullable = false)
    private Artist artist;

    protected Album() {
    }

    /** Uso em testes (entidade desanexada). */
    public Album(Long id, String titulo, Artist artist) {
        this.id = id;
        this.titulo = titulo;
        this.artist = artist;
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getCapaUrl() {
        return capaUrl;
    }

    public LocalDate getDataLancamento() {
        return dataLancamento;
    }

    public Artist getArtist() {
        return artist;
    }
}
