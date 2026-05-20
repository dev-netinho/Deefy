package br.com.deefy.service;

public interface EmailService {
    void enviarEmailLinkSenha(String emailDestino, String token);
}