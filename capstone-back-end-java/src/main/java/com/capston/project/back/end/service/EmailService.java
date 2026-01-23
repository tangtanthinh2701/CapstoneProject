package com.capston.project.back.end.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);

    void sendNotificationEmail(String toEmail, String subject, String message);
}
