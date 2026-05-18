package br.com.deefy.mapper;


import br.com.deefy.dto.request.ListeningHistoryRequest;
import br.com.deefy.dto.request.ListeningHistoryResponse;
import br.com.deefy.model.ListeningHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ListeningHistoryMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "music.id", target = "musicId")
    @Mapping(source = "dataHoraExecucao", target = "dataHoraExecucao")
    ListeningHistoryResponse toResponse(ListeningHistory entity);


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "music", ignore = true)
    @Mapping(target = "dataHoraExecucao", ignore = true)
    ListeningHistory toEntity(ListeningHistoryRequest request);
}
