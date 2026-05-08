package br.com.deefy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Esta anotação diz ao Spring qual código HTTP devolver automaticamente
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PlaylistException extends RuntimeException {
    public PlaylistException(String mensagem) {
        super(mensagem);
    }
}