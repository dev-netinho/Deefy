package br.com.deefy.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorDetails(

        // Hora do erro
        LocalDateTime timestamp,

        // Status do erro
        int status,

        // Tipo do Erro
        String error,

        // Mensagens de erro
        List<String> messages,

        // Caminho do erro
        String path
) {
}