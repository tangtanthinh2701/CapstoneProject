package com.capston.project.back.end.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VNPayResponse {
    private Boolean success;
    private String message;
    private String paymentUrl;
    private String txnRef;
    private String transactionNo;
    private String responseCode;
    private Integer paymentId;
    private BigDecimal amount;
    private String paymentStatus;
}
