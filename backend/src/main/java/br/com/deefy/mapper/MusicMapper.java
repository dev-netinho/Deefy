package br.com.deefy.mapper;

import br.com.deefy.dto.request.MusicRequestDTO;
import br.com.deefy.dto.response.MusicDetailResponseDTO;
import br.com.deefy.dto.response.MusicListResponseDTO;
import br.com.deefy.model.Music;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MusicMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "album", ignore = true)
    Music toEntity(MusicRequestDTO requestDTO);

    @Mapping(target = "artist", source = "artist")
    @Mapping(target = "album", source = "album.titulo")
    @Mapping(target = "dataLancamento", source = "album.dataLancamento")
    MusicDetailResponseDTO toDetailDTO(Music music);

    @Mapping(target = "artist", source = "artist")
    @Mapping(target = "album", source = "albumTitle")
    MusicListResponseDTO toListDTO(Music music);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "album", ignore = true)
    void updateEntity(MusicRequestDTO requestDTO, @MappingTarget Music music);
}
