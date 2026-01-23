package com.capston.project.back.end.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
public class VNPayConfig {
    private String payUrl;
    private String returnUrl;
    private String ipnUrl;
    private String tmnCode;
    private String hashSecret;
    private String version;
    private String command;
    private String orderType;
}

