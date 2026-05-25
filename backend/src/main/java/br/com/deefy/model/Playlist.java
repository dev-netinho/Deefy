package br.com.deefy.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "playlist")
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User owner;

    @Column(name = "nome", nullable = false, length = 100)
    private String name;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String description;

    @Column(name = "capaurl", columnDefinition = "TEXT")
    private String coverUrl;

    @Column(name = "publica", nullable = false)
    private boolean publica;

    @Column(name = "datacriacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @PrePersist
    protected void onCreate() {
        this.dataCriacao = LocalDateTime.now();
    }

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "playlist_musica",
            joinColumns = @JoinColumn(name = "playlist_id"),
            inverseJoinColumns = @JoinColumn(name = "musica_id"))
    @OrderColumn(name = "ordem")
    private List<Music> tracks = new ArrayList<>();

    public Playlist() {
    }

    public Playlist(Long id, User owner, String name, boolean publica, LocalDateTime dataCriacao, List<Music> tracks) {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.publica = publica;
        this.dataCriacao = dataCriacao;
        this.tracks = tracks == null ? new ArrayList<>() : new ArrayList<>(tracks);
    }

    public Long getId() {
        return id;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public boolean isPublica() {
        return publica;
    }

    public void setPublica(boolean publica) {
        this.publica = publica;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public List<Music> getTracks() {
        return tracks;
    }

    public void setTracks(List<Music> tracks) {
        this.tracks = tracks == null ? new ArrayList<>() : new ArrayList<>(tracks);
    }

    public void addTrack(Music music) {
        tracks.add(music);
    }

    public boolean hasTrackWithMusicId(Long musicId) {
        return tracks.stream()
                .anyMatch(track -> track.getId() != null && track.getId().equals(musicId));
    }

    public boolean removeFirstTrackByMusicId(Long musicId) {
        for (int i = 0; i < tracks.size(); i++) {
            Music track = tracks.get(i);
            if (track.getId() != null && track.getId().equals(musicId)) {
                tracks.remove(i);
                return true;
            }
        }
        return false;
    }

    public boolean belongsTo(Long usuarioId) {
        return owner != null && owner.getId() != null && owner.getId().equals(usuarioId);
    }

    public List<Long> getTrackIds() {
        return tracks.stream()
                .map(Music::getId)
                .toList();
    }
}
