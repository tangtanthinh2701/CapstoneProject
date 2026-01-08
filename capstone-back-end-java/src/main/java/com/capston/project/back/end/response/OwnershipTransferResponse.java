package com.capston.project.back.end.response;

import com.capston.project.back.end.common.TransferStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipTransferResponse {

	private Integer id;

	// Reference
	private Integer contractId;
	private String contractCode;
	private Integer ownershipId;

	// Transfer details
	private UUID fromUserId;
	private UUID toUserId;
	private BigDecimal carbonCredit;
	private BigDecimal transferPrice;

	// Status
	private TransferStatus status;
	private LocalDate transferDate;

	// Approval
	private UUID approvedBy;
	private OffsetDateTime approvedAt;

	private String notes;
	private OffsetDateTime createdAt;
}
