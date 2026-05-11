package br.com.deefy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MusicaNaoEncontradaException.class)
    public ResponseEntity<Map<String, Object>> handleMusicaNaoEncontradaException(MusicaNaoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", 404,
                "erro", "Música não encontrada",
                "mensagem", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
