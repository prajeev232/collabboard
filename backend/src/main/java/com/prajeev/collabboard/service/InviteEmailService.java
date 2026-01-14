package com.prajeev.collabboard.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class InviteEmailService {
    private final JavaMailSender mailSender;
    private final String from;
    private final String frontendBaseUrl;

    public InviteEmailService(JavaMailSender mailSender, @Value("${app.mail.from}") String from, @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.from = from;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendBoardInvite(String toEmail, String boardName, String rawToken) {
        String link = frontendBaseUrl.replaceAll("/$", "") + "/invite/" + rawToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setFrom(from);
        message.setSubject("You're invited to join \"" + boardName + "\" on CollabBoard");
        message.setText("""
                You've been invited to a board on CollabBoard.
                
                Board: %s
                Accept invite: %s
                
                If you didn't expect this, you can ignore this email.
                """.formatted(boardName, link));

        mailSender.send(message);
    }
}
