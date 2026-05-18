package br.com.deefy.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name="historico_execucao")
public class ListeningHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "musica_id", nullable = false)
    private Music music;

    @Column(name = "datahoraexecucao", nullable = false)
    private LocalDateTime dataHoraExecucao;

    public ListeningHistory() {
    }

    public ListeningHistory(User user, Music music, LocalDateTime dataHoraExecucao) {
        this.user = user;
        this.music = music;
        this.dataHoraExecucao = dataHoraExecucao;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Music getMusic() {
        return music;
    }

    public void setMusic(Music music) {
        this.music = music;
    }

    public LocalDateTime getDataHoraExecucao() {
        return dataHoraExecucao;
    }

    public void setDataHoraExecucao(LocalDateTime dataHoraExecucao) {
        this.dataHoraExecucao = dataHoraExecucao;
    }
}
