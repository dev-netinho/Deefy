package br.com.deefy.exception;

public class SenhaAtualIncorretaException extends RuntimeException {
    public SenhaAtualIncorretaException(String message) {
        super(message);
    }
}
