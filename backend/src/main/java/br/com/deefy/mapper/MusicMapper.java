package br.com.deefy.mapper;


import br.com.deefy.dto.response.AlbumResponseDTO;
import br.com.deefy.dto.response.ArtistaResponseDTO;
import br.com.deefy.dto.response.MusicDetailsResponseDTO;
import br.com.deefy.model.Album;
import br.com.deefy.model.Artist;
import br.com.deefy.model.Music;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface MusicMapper {

    @Mapping(target = "titulo", source = "title")
    @Mapping(target = "genero", source = "genre")
    @Mapping(target = "duracaoSegundos", source = "durationSeconds")
    @Mapping(target = "capaUrl", source = "coverUrl")
    @Mapping(target = "artista", source = "album.artist")
    @Mapping(target = "album", source = "album")
    MusicDetailsResponseDTO toDetailsDTO(Music music);

    @Mapping(target = "bio", source = "bio")
    ArtistaResponseDTO toArtistaDTO(Artist artist);

    @Mapping(target = "capaUrl", source = "capaUrl")
    AlbumResponseDTO toAlbumDTO(Album album);

}
