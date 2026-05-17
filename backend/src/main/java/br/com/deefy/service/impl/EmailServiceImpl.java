package br.com.deefy.service.impl;

import br.com.deefy.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    // Injeta o motor do Spring Mail configurado no application.properties
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void enviarEmailLinkSenha(String emailDestino, String token) {
        try {
            // MimeMessage permite o envio de e-mails complexos com formatação HTML
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            //PRECISA MUDAR ISSO AQUI PARA URL DA  APLICAÇÃO
            String linkDeRecuperacao = "http://localhost:3000/reset-password?token=" + token;

            helper.setFrom(remetente);
            helper.setTo(emailDestino);
            helper.setSubject("Deefy - Recuperação de Senha");

            // Texto formatado com HTML básico para renderizar no cliente de e-mail
            helper.setText("<h2>Recuperação de Conta Deefy</h2>" +
                    "<p>Você solicitou a alteração da sua senha.</p>" +
                    "<p>Clique no botão abaixo para criar sua nova credencial. Válido por 15 minutos:</p>" +
                    "<a href='" + linkDeRecuperacao + "' style='display:inline-block;padding:12px 24px;background-color:#1db954;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:4px;'>Redefinir Minha Senha</a>", true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Falha ao disparar o e-mail de redefinição de senha: " + e.getMessage());
        }
    }
}