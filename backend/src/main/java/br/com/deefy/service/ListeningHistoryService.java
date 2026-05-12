package br.com.deefy.service;

import br.com.deefy.dto.request.ListeningHistoryRequest;
import br.com.deefy.dto.request.ListeningHistoryResponse;

import java.util.List;

public interface ListeningHistoryService {

    ListeningHistoryResponse saveListeningHistory(ListeningHistoryRequest request);
    List<ListeningHistoryResponse> getHistoryByUserId(Long userId);
}