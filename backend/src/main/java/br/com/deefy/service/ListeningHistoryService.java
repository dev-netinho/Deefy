package br.com.deefy.service;

import br.com.deefy.dto.request.ListeningHistoryRequest;
import br.com.deefy.dto.request.ListeningHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ListeningHistoryService {

    ListeningHistoryResponse saveListeningHistory(ListeningHistoryRequest request);
    Page<ListeningHistoryResponse> getHistoryByUserId(Long userId, Pageable pageable);
}