package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info("Sending OTP Email to: {}", toEmail);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@carbonmarket.com");
        message.setTo(toEmail);
        message.setSubject("Mã OTP xác thực đặt lại mật khẩu");
        message.setText("Mã OTP của bạn là: " + otpCode + ". Mã này có hiệu lực trong 10 phút.");

        try {
            mailSender.send(message);
            log.info("OTP Email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    public void sendNotificationEmail(String toEmail, String subject, String messageContent) {
        log.info("Sending Notification Email to: {}", toEmail);

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom("no-reply@carbonmarket.com");
        msg.setTo(toEmail);
        msg.setSubject(subject);
        msg.setText(messageContent);

        try {
            mailSender.send(msg);
            log.info("Notification Email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send notification email to {}: {}", toEmail, e.getMessage());
        }
    }
}
