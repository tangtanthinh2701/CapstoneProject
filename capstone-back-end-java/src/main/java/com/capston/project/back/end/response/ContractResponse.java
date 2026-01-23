package com.capston.project.back.end.response;

import com.capston.project.back.end.common.ContractStatus;
import com.capston.project.back.end.common.ContractType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractResponse {

	private Integer id;
	private String contractCode;

	// Project info
	private Integer projectId;
	private String projectName;
	private String projectCode;

	// Contract details
	private ContractType contractType;
	private BigDecimal unitPrice;
	private BigDecimal totalAmount;
	private Integer contractTermYears;
	private LocalDate startDate;
	private LocalDate endDate;

	// Renewal info
	private Boolean autoRenewal;
	private Integer renewalTermYears;
	private Integer renewalNoticeDays;
	private Integer maxRenewals;
	private Integer renewalCount;
	private Boolean canRenew;

	// Rights
	private Map<String, Object> content;
	private Boolean harvestRights;
	private Boolean transferAllowed;

	// Termination
	private BigDecimal earlyTerminationPenalty;
	private String terminationReason;
	private OffsetDateTime terminatedAt;

	// Status
	private ContractStatus contractStatus;
	private Boolean isExpiringSoon;
	private Boolean isExpired;
	private Integer daysUntilExpiry;

	// Payment & Files
	private LocalDate paymentDate;
	private String contractFileUrl;

	// Approval
	private UUID approvedBy;
	private OffsetDateTime approvedAt;

	private String notes;

	// Service
	private String serviceScope;
	private Map<String, Object> kpiRequirements;

	// Tracking
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

	// Related
	private List<ContractRenewalResponse> renewals;
	private Integer totalOwnerships;
}