package br.com.deefy.mapper;

import br.com.deefy.dto.request.MusicRequestDTO;
import br.com.deefy.dto.response.MusicDetailResponseDTO;
import br.com.deefy.dto.response.MusicListResponseDTO;
import br.com.deefy.model.Music;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.Objects;

@Mapper(componentModel = "spring")
public interface MusicMapper {

    default Music toEntity(MusicRequestDTO requestDTO) {
        Music music = new Music();
        updateEntity(requestDTO, music);
        return music;
    }

    default MusicDetailResponseDTO toDetailDTO(Music music) {
        return new MusicDetailResponseDTO(
                music.getId(),
                music.getTitle(),
                music.getArtist(),
                music.getAlbumTitle(),
                music.getGenre(),
                music.getDurationSeconds(),
                music.getCoverUrl(),
                music.getPreviewUrl(),
                music.getFileUrl(),
                null
        );
    }

    default MusicListResponseDTO toListDTO(Music music) {
        return new MusicListResponseDTO(
                music.getId(),
                music.getTitle(),
                music.getArtist(),
                music.getAlbumTitle(),
                music.getDurationSeconds(),
                music.getDuration(),
                music.getCoverUrl(),
                music.getPreviewUrl(),
                music.getFileUrl()
        );
    }

    default void updateEntity(MusicRequestDTO requestDTO, @MappingTarget Music music) {
        music.setTitle(requestDTO.title());
        music.setGenre(requestDTO.genre());
        music.setDurationSeconds(requestDTO.durationSeconds());
        music.setPreviewUrl(requestDTO.previewUrl());
        music.setCoverUrl(requestDTO.coverUrl());
        music.setFileUrl(Objects.requireNonNullElse(requestDTO.fileUrl(), ""));
    }
}
