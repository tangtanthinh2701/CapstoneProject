package com.capston.project.back.end.response;

import com.capston.project.back.end.common.AllocationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditAllocationResponse {
	private Integer id;

	// Credit info
	private Integer creditId;
	private String creditCode;

	// Ownership info
	private Integer ownershipId;
	private Integer projectId;
	private String projectName;

	// Allocation details
	private Integer allocatedCredits;
	private BigDecimal percentage;
	private UUID ownerId;

	// Status
	private AllocationStatus status;
	private OffsetDateTime claimedAt;

	private String notes;
	private OffsetDateTime createdAt;
}
