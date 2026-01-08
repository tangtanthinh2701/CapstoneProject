package com.capston.project.back.end.response;

import com.capston.project.back.end.common.TransactionStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time. OffsetDateTime;
import java. util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditTransactionResponse {
	private Integer id;
	private String transactionCode;

	// Credit info
	private Integer creditId;
	private String creditCode;
	private Integer projectId;
	private String projectName;

	// Transaction details
	private UUID enterpriseId;
	private Integer quantity;
	private BigDecimal unitPrice;
	private BigDecimal totalAmount;

	// Status
	private TransactionStatus transactionStatus;
	private String certificateUrl;
	private String retirementReason;

	// Dates
	private OffsetDateTime purchasedAt;
	private OffsetDateTime retiredAt;
	private OffsetDateTime createdAt;
}
