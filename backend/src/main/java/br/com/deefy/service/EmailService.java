package br.com.deefy.service;

public interface EmailService {
    void enviarEmailLinkSenha(String emailDestino, String token);

    void enviarEmailAtivacaoConta(String emailDestino, String token);
}