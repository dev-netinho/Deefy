package br.com.deefy.exception;

public class GenreNotFoundException extends RuntimeException {

    public GenreNotFoundException(Long genreId) {
        super("Genre not found with id: " + genreId);
    }
}
