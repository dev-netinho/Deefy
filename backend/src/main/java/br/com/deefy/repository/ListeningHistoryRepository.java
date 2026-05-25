package br.com.deefy.repository;

import br.com.deefy.model.ListeningHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ListeningHistoryRepository extends JpaRepository<ListeningHistory, Long> {

    Page<ListeningHistory> findAllByUserIdOrderByDataHoraExecucaoDesc(Long userId, Pageable pageable);
}