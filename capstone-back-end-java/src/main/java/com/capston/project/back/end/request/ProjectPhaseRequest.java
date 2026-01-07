package com.capston.project.back.end.request;

import com.capston.project.back.end.common.PhaseStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPhaseRequest {
	private Integer id;

	@NotNull(message = "Phase order is required")
	@Positive(message = "Phase order must be positive")
	private Integer phaseOrder;

	private String phaseName;

	private String description;

	private PhaseStatus phaseStatus;

	private LocalDate expectedStartDate;

	private LocalDate expectedEndDate;

	@NotNull(message = "Actual start date is required")
	private LocalDate actualStartDate;

	private LocalDate actualEndDate;

	private BigDecimal budget;

	private BigDecimal targetConsumedCarbon;

	private String notes;

	private UUID createdBy;
}
