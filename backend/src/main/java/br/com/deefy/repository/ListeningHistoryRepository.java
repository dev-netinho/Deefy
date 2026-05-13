package br.com.deefy.repository;

import br.com.deefy.model.ListeningHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListeningHistoryRepository extends JpaRepository<ListeningHistory, Long>{

    List<ListeningHistory> findAllByUserIdOrderByDataHoraExecucaoDesc(Long userIthd);
}