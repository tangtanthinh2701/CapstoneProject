package com.capston.project.back.end.request;

import com.capston.project.back.end.common.ContractCategory;
import com.capston.project.back.end.common.ContractType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRequest {

	@NotNull(message = "Project ID is required")
	private Integer projectId;

	private ContractCategory contractCategory;

	private ContractType contractType;

	@NotNull(message = "Unit price is required")
	@DecimalMin(value = "0.01", message = "Unit price must be positive")
	private BigDecimal unitPrice;

	@NotNull(message = "Total amount is required")
	@DecimalMin(value = "0.01", message = "Total amount must be positive")
	private BigDecimal totalAmount;

	@Min(value = 1, message = "Contract term must be at least 1 year")
	private Integer contractTermYears;

	private LocalDate startDate;

	private LocalDate endDate;

	// Renewal settings
	private Boolean autoRenewal;
	private Integer renewalTermYears;
	private Integer renewalNoticeDays;
	private Integer maxRenewals;

	// Rights
	private Map<String, Object> content;
	private Boolean harvestRights;
	private Boolean transferAllowed;

	// Termination
	private BigDecimal earlyTerminationPenalty;

	// Files
	private String contractFileUrl;

	private String notes;

	// Service contract
	private String serviceScope;
	private Map<String, Object> kpiRequirements;
}
