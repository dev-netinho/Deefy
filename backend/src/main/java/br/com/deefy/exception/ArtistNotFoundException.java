package br.com.deefy.exception;

public class ArtistNotFoundException extends RuntimeException {

    public ArtistNotFoundException(Long artistId) {
        super("Artist not found with id: " + artistId);
    }
}
