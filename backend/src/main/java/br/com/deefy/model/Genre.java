package br.com.deefy.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "genero")
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column(name = "capaurl", columnDefinition = "TEXT")
    private String capaUrl;

    @Column(name = "datalancamento")
    private LocalDate dataLancamento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artista_id", nullable = false)
    private Artist artista;

    protected Genre() {
    }

    public Genre(Long id, String titulo, Artist artista) {
        this.id = id;
        this.titulo = titulo;
        this.artista = artista;
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

    public Artist getArtista() {
        return artista;
    }
}
