package br.com.deefy.model;

import jakarta.persistence.*;

/**
 * Tabela {@code musica} conforme {@code deefy_schema.sql} (título, álbum/artista, Deezer, etc.).
 */
@Entity
@Table(name = "musica")
public class Music {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "deezerid", unique = true, length = 100)
    private String deezerId;

    @Column(name = "titulo", nullable = false, length = 100)
    private String title;

    @Column(name = "duracao", nullable = false)
    private Integer durationSeconds;

    @Column(name = "previewurl", length = 100)
    private String previewUrl;

    @Column(name = "capaurl", length = 100)
    private String coverUrl;

    @Column(name = "genero", nullable = false, length = 100)
    private String genre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;

    protected Music() {
    }

    /** Uso em testes unitários (entidade desanexada). */
    public Music(Long id, String title, String genre, Integer durationSeconds, Album album) {
        this.id = id;
        this.title = title;
        this.genre = genre;
        this.durationSeconds = durationSeconds;
        this.album = album;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    /**
     * Nome do artista vem do álbum ({@code album.artista.nome}), quando existir.
     */
    public String getArtist() {
        if (album == null || album.getArtist() == null) {
            return null;
        }
        return album.getArtist().getNome();
    }

    public String getGenre() {
        return genre;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public String getPreviewUrl() {
        return previewUrl;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    /** Identificador na API Deezer (coluna {@code deezerid}). */
    public String getExternalId() {
        return deezerId;
    }

    public Album getAlbum() {
        return album;
    }
}
