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

            // Template HTML Premium e Tematizado com a identidade visual do Deefy
            helper.setText(
                    "<div style='background-color: #0d0d0d; padding: 40px 20px; font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif; min-height: 100%; margin: 0;'>" +
                            "<table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 460px; background-color: #181818; border-radius: 16px; border: 1px solid #262626; padding: 40px; text-align: center;'>" +
                            "<tr>" +
                            "<td align='center' style='padding-bottom: 32px;'>" +
                            // Simulação do Logo Deefy estilizado em CSS
                            "<h1 style='color: #2ce5c2; font-size: 38px; font-weight: 800; margin: 0; letter-spacing: -1.5px; font-style: italic;'>deefy</h1>" +
                            "</td>" +
                            "</tr>" +
                            "<tr>" +
                            "<td align='center'>" +
                            "<h2 style='color: #ffffff; font-size: 22px; font-weight: 600; margin: 0 0 16px 0; letter-spacing: -0.5px;'>Recuperação de Conta</h2>" +
                            "<p style='color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 0 0 32px 0;'>Você solicitou a redefinição da sua senha de acesso. Clique no botão abaixo para criar sua nova credencial.</p>" +
                            "</td>" +
                            "</tr>" +
                            "<tr>" +
                            "<td align='center'>" +
                            // Botão no padrão do botão "Entrar" (Cyan Neon, texto escuro e cantos arredondados em 12px)
                            "<a href='" + linkDeRecuperacao + "' style='display: inline-block; padding: 14px 36px; background-color: #2ce5c2; color: #0d0d0d; text-decoration: none; font-weight: bold; font-size: 15px; border-radius: 12px; letter-spacing: -0.2px;'>Redefinir Minha Senha</a>" +
                            "</td>" +
                            "</tr>" +
                            "<tr>" +
                            "<td align='center' style='padding-top: 32px;'>" +
                            "<p style='color: #666666; font-size: 12px; margin: 0 0 4px 0;'>Este link é válido por apenas 15 minutos.</p>" +
                            "<p style='color: #444444; font-size: 11px; margin: 0;'>Se você não solicitou esta alteração, ignore este e-mail.</p>" +
                            "</td>" +
                            "</tr>" +
                            "</table>" +
                            "</div>", true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Falha ao disparar o e-mail de redefinição de senha: " + e.getMessage());
        }
    }
}