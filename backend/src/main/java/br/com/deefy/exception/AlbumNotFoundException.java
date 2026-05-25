package br.com.deefy.exception;

public class AlbumNotFoundException extends RuntimeException {
    public AlbumNotFoundException(Long albumId) {
        super("Album not found with id: " + albumId);
    }
}