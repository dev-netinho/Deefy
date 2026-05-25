package br.com.deefy.exception.handler;

import br.com.deefy.dto.ErrorDetails;
import br.com.deefy.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Método utilitário para padronizar respostas
    private ResponseEntity<ErrorDetails> buildResponse(
            HttpStatus status,
            List<String> messages,
            String path
    ) {

        ErrorDetails errorResponse = new ErrorDetails(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                messages,
                path
        );

        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<ErrorDetails> handleUsuarioNaoEncontrado(
            UsuarioNaoEncontradoException ex,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                List.of(ex.getMessage()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<ErrorDetails> handleEmailJaCadastrado(
            EmailJaCadastradoException ex,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                List.of(ex.getMessage()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDetails> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .toList();

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                errors,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(TokenInvalidoException.class)
    public ResponseEntity<ErrorDetails> handleTokenInvalido(
            TokenInvalidoException ex,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                List.of(ex.getMessage()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(SenhaAtualIncorretaException.class)
    public ResponseEntity<ErrorDetails> handleSenhaAtualIncorreta(
            SenhaAtualIncorretaException ex,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                List.of(ex.getMessage()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(ProfilePhotoStorageException.class)
    public ResponseEntity<ErrorDetails> handleProfilePhotoStorage(
            ProfilePhotoStorageException ex,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                List.of(ex.getMessage()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(MusicNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleMusicaNaoEncontradaException(
            MusicNotFoundException ex,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                List.of(ex.getMessage()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(ArtistNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleArtistNotFoundException(
            ArtistNotFoundException ex,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                List.of(ex.getMessage()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(GenreNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleGenreNotFoundException(
            GenreNotFoundException ex,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                List.of(ex.getMessage()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(PlaylistException.class)
    public ResponseEntity<ErrorDetails> handlePlaylistException(
            PlaylistException ex,
            HttpServletRequest request
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                List.of(ex.getMessage()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleGenericException(
            Exception ex,
            HttpServletRequest request
    ) {

        log.error("Erro nao tratado em {} {}", request.getMethod(), request.getRequestURI(), ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                List.of("Internal server error"),
                request.getRequestURI()
        );
    }
}
