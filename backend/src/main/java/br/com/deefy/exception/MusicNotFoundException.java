package br.com.deefy.exception;

public class MusicNotFoundException extends RuntimeException {

    public MusicNotFoundException(Long musicId) {
        super("Music not found with id: " + musicId);
    }
}
