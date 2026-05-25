package br.com.deefy.mapper;

import br.com.deefy.dto.response.AlbumResponseDTO;
import br.com.deefy.dto.response.ArtistaResponseDTO;
import br.com.deefy.dto.response.PlaylistResponseDTO;
import br.com.deefy.dto.response.MusicDetailsResponseDTO;
import br.com.deefy.model.Artist;
import br.com.deefy.model.Playlist;
import br.com.deefy.model.Music;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlaylistMapper {

    default PlaylistResponseDTO toResponseDTO(Playlist playlist) {
        if (playlist == null) {
            return null;
        }

        return new PlaylistResponseDTO(
                playlist.getId(),
                playlist.getName(),
                playlist.getDescription(),
                playlist.getDescription(),
                playlist.getCoverUrl(),
                playlist.getCoverUrl(),
                playlist.isPublica(),
                playlist.getDataCriacao(),
                toMusicDTOList(playlist.getTracks(), playlist.getName())
        );
    }

    default MusicDetailsResponseDTO toMusicDTO(Music music, String playlistName) {
        if (music == null) {
            return null;
        }

        Artist artist = music.getArtistEntity();

        return new MusicDetailsResponseDTO(
                music.getId(),
                music.getTitle(),
                music.getGenre(),
                music.getDurationSeconds() == null ? 0 : music.getDurationSeconds(),
                music.getPreviewUrl(),
                music.getCoverUrl(),
                music.getFileUrl(),
                toArtistDTO(artist),
                new AlbumResponseDTO(null, playlistName, music.getCoverUrl(), null)
        );
    }

    default List<MusicDetailsResponseDTO> toMusicDTOList(List<Music> tracks, String playlistName) {
        if (tracks == null) {
            return List.of();
        }

        return tracks.stream()
                .map(music -> toMusicDTO(music, playlistName))
                .toList();
    }

    private ArtistaResponseDTO toArtistDTO(Artist artist) {
        if (artist == null) {
            return null;
        }

        return new ArtistaResponseDTO(
                artist.getId(),
                artist.getNome(),
                artist.getBio(),
                artist.getFotoUrl()
        );
    }
}
