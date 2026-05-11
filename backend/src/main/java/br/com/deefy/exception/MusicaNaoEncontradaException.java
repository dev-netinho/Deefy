package br.com.deefy.exception;

public class MusicaNaoEncontradaException extends RuntimeException {
    public MusicaNaoEncontradaException(Long id) {
        super("Musica não encontrada: " + id);
    }
}
