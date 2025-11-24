package com.capston.project.back.end.dtos;

import com.capston.project.back.end.common.PhaseStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPhaseDTO {
	private Integer id;
	private Integer phaseNumber;
	private String phaseName;
	private String description;
	private PhaseStatus phaseStatus;
	private LocalDate startDate;
	private LocalDate endDate;
	private Integer expectedDurationDays;
	private Integer actualDurationDays;
	private BigDecimal budget;
	private BigDecimal actualCost;
	private List<TreeSpeciesDTO> treeSpecies;
}
