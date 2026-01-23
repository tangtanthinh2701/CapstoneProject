package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info("Sending OTP Email to: {}", toEmail);
        log.info("Your OTP code is: {}", otpCode);
        // In a real implementation, we would use JavaMailSender here.
    }

    @Override
    public void sendNotificationEmail(String toEmail, String subject, String message) {
        log.info("Sending Notification Email to: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Message: {}", message);
    }
}
