package com.capston.project.back.end.request;

import com.capston.project.back.end.common.PhaseStatus;
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

	private Integer phaseNumber;

	private String phaseName;

	private String description;

	private PhaseStatus phaseStatus;

	private LocalDate plannedStartDate;

	private LocalDate plannedEndDate;

	private LocalDate actualStartDate;

	private LocalDate actualEndDate;

	private BigDecimal budget;

	private BigDecimal targetCo2Kg;

	private String notes;

	private UUID createdBy;
}
