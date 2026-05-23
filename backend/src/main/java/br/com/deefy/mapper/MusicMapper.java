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
    @Mapping(target = "artist", ignore = true)
    @Mapping(target = "fileUrl", source = "fileUrl", defaultValue = "")
    Music toEntity(MusicRequestDTO requestDTO);

    @Mapping(target = "album", source = "albumTitle")
    @Mapping(target = "dataLancamento", ignore = true)
    MusicDetailResponseDTO toDetailDTO(Music music);

    @Mapping(target = "album", source = "albumTitle")
    MusicListResponseDTO toListDTO(Music music);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "artist", ignore = true)
    @Mapping(target = "fileUrl", source = "fileUrl", defaultValue = "")
    void updateEntity(MusicRequestDTO requestDTO, @MappingTarget Music music);
}
