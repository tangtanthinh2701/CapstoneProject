package com.capston.project.back.end.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditTransactionResponse {
	private Integer id;
	private String transactionCode;
	private String creditCode;
	private String enterpriseName;
	private Integer quantity;
	private BigDecimal unitPrice;
	private BigDecimal totalAmount;
	private String transactionStatus;
	private String certificateUrl;
	private String retirementReason;
	private OffsetDateTime purchasedAt;
	private OffsetDateTime retiredAt;
}
