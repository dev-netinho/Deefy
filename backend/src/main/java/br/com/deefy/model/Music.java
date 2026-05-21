package br.com.deefy.model;

import jakarta.persistence.*;

@Entity
@Table(name = "musica")
public class Music {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "titulo", nullable = false, length = 100)
    private String title;

    @Column(name = "duracao", nullable = false)
    private Integer durationSeconds;

    @Column(name = "previewurl", columnDefinition = "TEXT")
    private String previewUrl;

    @Column(name = "capaurl", columnDefinition = "TEXT")
    private String coverUrl;

    @Column(name = "arquivourl", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "genero", nullable = false, length = 100)
    private String genre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;

    public Music() {
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
        if (coverUrl != null && !coverUrl.isBlank()) {
            return coverUrl;
        }
        return album == null ? null : album.getCapaUrl();
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public String getAlbumTitle() {
        return album == null ? null : album.getTitulo();
    }

    public String getDuration() {
        if (durationSeconds == null || durationSeconds <= 0) {
            return "--:--";
        }

        int minutes = durationSeconds / 60;
        int seconds = durationSeconds % 60;
        return "%d:%02d".formatted(minutes, seconds);
    }

    public Album getAlbum() {
        return album;
    }

    public void setAlbum(Album album) {
        this.album = album;
    }

    public void setPreviewUrl(String previewUrl) {
        this.previewUrl = previewUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}
