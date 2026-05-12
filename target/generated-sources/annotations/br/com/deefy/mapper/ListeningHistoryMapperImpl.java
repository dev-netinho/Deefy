package br.com.deefy.mapper;

import br.com.deefy.dto.request.ListeningHistoryRequest;
import br.com.deefy.dto.request.ListeningHistoryResponse;
import br.com.deefy.model.ListeningHistory;
import br.com.deefy.model.Music;
import br.com.deefy.model.User;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-12T18:50:04-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Microsoft)"
)
@Component
public class ListeningHistoryMapperImpl implements ListeningHistoryMapper {

    @Override
    public ListeningHistoryResponse toResponse(ListeningHistory entity) {
        if ( entity == null ) {
            return null;
        }

        Long userId = null;
        Long musicId = null;
        LocalDateTime dataHoraExecucao = null;
        Long id = null;

        userId = entityUserId( entity );
        musicId = entityMusicId( entity );
        dataHoraExecucao = entity.getDataHoraExecucao();
        id = entity.getId();

        ListeningHistoryResponse listeningHistoryResponse = new ListeningHistoryResponse( id, userId, musicId, dataHoraExecucao );

        return listeningHistoryResponse;
    }

    @Override
    public ListeningHistory toEntity(ListeningHistoryRequest request) {
        if ( request == null ) {
            return null;
        }

        ListeningHistory listeningHistory = new ListeningHistory();

        return listeningHistory;
    }

    private Long entityUserId(ListeningHistory listeningHistory) {
        if ( listeningHistory == null ) {
            return null;
        }
        User user = listeningHistory.getUser();
        if ( user == null ) {
            return null;
        }
        Long id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long entityMusicId(ListeningHistory listeningHistory) {
        if ( listeningHistory == null ) {
            return null;
        }
        Music music = listeningHistory.getMusic();
        if ( music == null ) {
            return null;
        }
        Long id = music.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
