package com.capston.project.back.end.response;

import com.capston.project.back.end.common.RenewalStatus;
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
public class ContractRenewalResponse {

	private Integer id;
	private Integer originalContractId;
	private String originalContractCode;
	private Integer newContractId;
	private String newContractCode;

	private Integer renewalNumber;
	private Integer renewalTermYears;
	private LocalDate oldEndDate;
	private LocalDate newStartDate;
	private LocalDate newEndDate;
	private BigDecimal renewalAmount;

	private RenewalStatus status;

	private UUID requestedBy;
	private OffsetDateTime requestedAt;
	private UUID approvedBy;
	private OffsetDateTime approvedAt;

	private String notes;
	private OffsetDateTime createdAt;
}
