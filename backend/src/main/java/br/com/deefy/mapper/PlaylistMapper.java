package br.com.deefy.mapper;

import br.com.deefy.dto.response.PlaylistResponseDTO;
import br.com.deefy.dto.response.MusicDetailsResponseDTO;
import br.com.deefy.model.Playlist;
import br.com.deefy.model.Music;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlaylistMapper {

    // O MapStruct mapeia 'id', 'name' e 'publica' automaticamente.
    // Ele também buscará um metodo para converter a lista de Music para MusicDetailsResponseDTO.
    PlaylistResponseDTO toResponseDTO(Playlist playlist);

    // Mapeamento específico para a música, ajustando os nomes dos campos
    // Exemplo: se na sua Entity Music o campo for 'title', mas no DTO for 'titulo'
    @Mapping(source = "title", target = "titulo")
    @Mapping(source = "genre", target = "genero")
    @Mapping(source = "durationSeconds", target = "duracaoSegundos")
    @Mapping(source = "coverUrl", target = "capaUrl")
    @Mapping(source = "fileUrl", target = "arquivoUrl")
    @Mapping(source = "artistEntity", target = "artista")
    @Mapping(target = "album", ignore = true)
    MusicDetailsResponseDTO toMusicDTO(Music music);

    List<MusicDetailsResponseDTO> toMusicDTOList(List<Music> tracks);
}
