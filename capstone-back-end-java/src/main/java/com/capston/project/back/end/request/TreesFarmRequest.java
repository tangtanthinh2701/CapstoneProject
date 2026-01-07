package com.capston.project.back.end.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java. math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreesFarmRequest {
	@NotNull(message = "Farm ID is required")
	private Integer farmId;

	@NotNull(message = "Tree species ID is required")
	private Integer treeSpeciesId;

	@NotNull(message = "Number of trees is required")
	@Min(value = 1, message = "Number of trees must be at least 1")
	private Integer numberTrees;

	private BigDecimal latitude;

	private BigDecimal longitude;

	@NotNull(message = "Planting date is required")
	private LocalDate plantingDate;

	private BigDecimal currentAvgHeight;
	private BigDecimal currentAvgTrunkDiameter;
	private BigDecimal currentAvgCanopyDiameter;
}
