package br.com.deefy.exception;

public class ProfilePhotoStorageException extends RuntimeException {
    public ProfilePhotoStorageException(String message) {
        super(message);
    }

    public ProfilePhotoStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
