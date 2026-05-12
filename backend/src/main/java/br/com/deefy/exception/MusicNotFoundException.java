package br.com.deefy.exception;

public class MusicNotFoundException extends RuntimeException {
    public MusicNotFoundException(Long id) {
        super("Musica não encontrada: " + id);
    }
}
