package br.com.deefy.exception.handler;

import br.com.deefy.dto.ErrorDetails;
import br.com.deefy.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleUsuarioNaoEncontrado(UsuarioNaoEncontradoException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<Map<String, Object>> handleEmailJaCadastrado(EmailJaCadastradoException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // Método utilitário para formatar a resposta JSON
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", status.value());
        errorResponse.put("error", status.getReasonPhrase());
        errorResponse.put("message", message);
        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Pega todos os erros do @Valid e junta numa String
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        return buildResponse(HttpStatus.BAD_REQUEST, errorMessage);
    }

    @ExceptionHandler(TokenInvalidoException.class)
    public ResponseEntity<Map<String, Object>> handleTokenInvalido(TokenInvalidoException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(SenhaAtualIncorretaException.class)
    public ResponseEntity<Map<String, Object>> handleSenhaAtualIncorreta(SenhaAtualIncorretaException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ProfilePhotoStorageException.class)
    public ResponseEntity<Map<String, Object>> handleProfilePhotoStorage(ProfilePhotoStorageException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MusicNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleMusicaNaoEncontradaException(MusicNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", 404,
                "erro", "Música não encontrada",
                "mensagem", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(ArtistNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleArtistNotFoundException(ArtistNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(GenreNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleGenreNotFoundException(GenreNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(PlaylistException.class)
    public ResponseEntity<ErrorDetails> handlePlaylistException(PlaylistException ex, WebRequest request) {
        ErrorDetails errorDetails = new ErrorDetails(
                LocalDateTime.now(),
                ex.getMessage(),
                request.getDescription(false)
        );

        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

}
