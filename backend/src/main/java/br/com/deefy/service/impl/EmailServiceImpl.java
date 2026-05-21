package br.com.deefy.service.impl;

import br.com.deefy.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    private final String apiKey;
    private final String remetente;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public EmailServiceImpl(
            @Value("${resend.api.key:re_chave_falsa_para_o_github}") String apiKey,
            @Value("${resend.from:Deefy <onboarding@resend.dev>}") String remetente,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.remetente = remetente;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    @Async
    @Override
    public void enviarEmailLinkSenha(String emailDestino, String token) {
        String linkDeRecuperacao = "http://localhost:3000/reset-password?token=" + token;

        String htmlContent =
                "<div style='background-color: #0d0d0d; padding: 40px 20px; font-family: sans-serif; text-align: center;'>" +
                        "<table align='center' style='max-width: 460px; background-color: #181818; border-radius: 16px; padding: 40px; border: 1px solid #262626;'>" +
                        "<tr><td><h1 style='color: #2ce5c2; font-style: italic; margin: 0;'>deefy</h1></td></tr>" +
                        "<tr><td><h2 style='color: #ffffff; margin: 20px 0 10px 0;'>Recuperação de Conta</h2>" +
                        "<p style='color: #a0a0a0; font-size: 14px; margin-bottom: 30px;'>Clique abaixo para criar sua nova credencial de acesso:</p></td></tr>" +
                        "<tr><td><a href='" + linkDeRecuperacao + "' style='display: inline-block; padding: 14px 36px; background-color: #2ce5c2; color: #0d0d0d; text-decoration: none; font-weight: bold; border-radius: 12px;'>Redefinir Minha Senha</a></td></tr>" +
                        "</table>" +
                        "</div>";

        dispararEmail(emailDestino, "Deefy - Recuperação de Senha", htmlContent);
    }

    @Async
    @Override
    public void enviarEmailAtivacaoConta(String emailDestino, String token) {
        String linkDeAtivacao = "http://localhost:3000/verify-account?token=" + token;

        String htmlContent =
                "<div style='background-color: #0d0d0d; padding: 40px 20px; font-family: sans-serif; text-align: center;'>" +
                        "<table align='center' style='max-width: 460px; background-color: #181818; border-radius: 16px; padding: 40px; border: 1px solid #262626;'>" +
                        "<tr><td><h1 style='color: #2ce5c2; font-style: italic; margin: 0;'>deefy</h1></td></tr>" +
                        "<tr><td><h2 style='color: #ffffff; margin: 20px 0 10px 0;'>Seja bem-vindo!</h2>" +
                        "<p style='color: #a0a0a0; font-size: 14px; margin-bottom: 30px;'>Clique abaixo para ativar a sua conta e liberar o seu acesso:</p></td></tr>" +
                        "<tr><td><a href='" + linkDeAtivacao + "' style='display: inline-block; padding: 14px 36px; background-color: #2ce5c2; color: #0d0d0d; text-decoration: none; font-weight: bold; border-radius: 12px;'>Ativar Minha Conta</a></td></tr>" +
                        "</table>" +
                        "</div>";

        dispararEmail(emailDestino, "Deefy - Ative sua Conta", htmlContent);
    }

    private void dispararEmail(String destinatario, String assunto, String htmlBody) {
        try {
            Map<String, Object> payload = Map.of(
                    "from", this.remetente,
                    "to", List.of(destinatario),
                    "subject", assunto,
                    "html", htmlBody
            );

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                throw new RuntimeException("Resend API retornou erro HTTP " + response.statusCode() + ": " + response.body());
            }

        } catch (Exception e) {
            throw new RuntimeException("Falha ao enviar e-mail via Resend API: " + e.getMessage(), e);
        }
    }
}
