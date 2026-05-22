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

    @Transient
    private String previewUrl;

    @Column(name = "capaurl", columnDefinition = "TEXT")
    private String coverUrl;

    @Column(name = "arquivourl", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "genero", nullable = false, length = 100)
    private String genre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artista_id")
    private Artist artist;

    public Music() {
    }

    /** Uso em testes unitários (entidade desanexada). */
    public Music(Long id, String title, String genre, Integer durationSeconds, Artist artist) {
        this.id = id;
        this.title = title;
        this.genre = genre;
        this.durationSeconds = durationSeconds;
        this.artist = artist;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    /**
     * Nome do artista vem da FK direta {@code musica.artista_id}.
     */
    public String getArtist() {
        return artist == null ? null : artist.getNome();
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
        return null;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public String getAlbumTitle() {
        return genre;
    }

    public String getDuration() {
        if (durationSeconds == null || durationSeconds <= 0) {
            return "--:--";
        }

        int minutes = durationSeconds / 60;
        int seconds = durationSeconds % 60;
        return "%d:%02d".formatted(minutes, seconds);
    }

    public Artist getArtistEntity() {
        return artist;
    }

    public void setArtist(Artist artist) {
        this.artist = artist;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
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
