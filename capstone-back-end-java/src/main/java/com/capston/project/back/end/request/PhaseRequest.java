package com.capston.project.back.end.request;

import com.capston.project.back.end.common.PhaseStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhaseRequest {
	@NotNull(message = "Số thứ tự giai đoạn không được để trống")
	private Integer phaseNumber;

	private String phaseName;

	private String description;

	private LocalDate startDate;

	private LocalDate endDate;

	private PhaseStatus phaseStatus;

	private Integer expectedDurationDays;

	private Integer actualDurationDays;

	private BigDecimal budget;

	private BigDecimal actualCost;

	private String notes;

	private UUID createdBy;

	@NotEmpty(message = "Phải có ít nhất một loại cây")
	private List<TreeSpeciesOnPhaseRequest> treeSpecies;
}
