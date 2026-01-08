package com.capston.project.back.end.response;

import com.capston.project.back.end.common.OwnershipStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OxiOwnershipResponse {

	private Integer id;

	// Contract info
	private Integer contractId;
	private String contractCode;

	// Project info
	private Integer projectId;
	private String projectName;
	private String projectCode;

	// Tree species info
	private Integer treeSpeciesId;
	private String treeSpeciesName;

	// Owner info
	private UUID ownerId;

	// Ownership details
	private LocalDate ownershipStartDate;
	private LocalDate ownershipEndDate;
	private BigDecimal carbonCreditPercentage;

	// Status
	private OwnershipStatus status;
	private Boolean isActive;
	private Boolean isExpired;
	private Boolean isExpiringSoon;
	private Integer daysUntilExpiry;

	// Tracking
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

	// Related data
	private List<OwnershipTransferResponse> transfers;
	private Integer totalCreditAllocations;
	private BigDecimal totalCreditsReceived;
}