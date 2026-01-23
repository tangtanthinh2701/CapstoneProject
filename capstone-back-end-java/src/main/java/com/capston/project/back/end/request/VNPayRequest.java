package com.capston.project.back.end.request;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VNPayRequest {
    private BigDecimal amount;
    private String description;
    private String bankCode;
    private String ipAddress;
    private Integer contractId;
    private Integer creditTransactionId;
}
