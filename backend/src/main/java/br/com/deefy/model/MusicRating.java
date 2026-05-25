package br.com.deefy.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Tabela {@code avaliacao}: nota de 1 a 5 por usuário e música (uma avaliação por par).
 */
@Entity
@Table(
        name = "avaliacao",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "musica_id"}))
public class MusicRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "musica_id", nullable = false)
    private Music music;

    @Column(name = "nota", nullable = false)
    private Integer score;

    @Column(name = "avaliado_em", nullable = false)
    private LocalDateTime ratedAt;

    protected MusicRating() {
    }

    public MusicRating(Long id, Long userId, Music music, Integer score, LocalDateTime ratedAt) {
        this.id = id;
        this.userId = userId;
        this.music = music;
        this.score = score;
        this.ratedAt = ratedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Music getMusic() {
        return music;
    }

    public void setMusic(Music music) {
        this.music = music;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public LocalDateTime getRatedAt() {
        return ratedAt;
    }

    public void setRatedAt(LocalDateTime ratedAt) {
        this.ratedAt = ratedAt;
    }
}
