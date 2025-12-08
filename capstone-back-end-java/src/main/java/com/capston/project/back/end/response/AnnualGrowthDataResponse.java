package com.capston.project.back.end.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnualGrowthDataResponse {
	private Integer id;
	private Integer projectId;
	private String projectName;
	private TreeSpeciesSimpleResponse treeSpecies;
	private Integer reportYear;
	private Integer treesAlive;
	private BigDecimal avgHeight;
	private BigDecimal avgCanopyDiameter;
	private BigDecimal avgTrunkDiameter;
	private BigDecimal survivalRate;
	private String healthStatus;
	private String diseases;
	private BigDecimal co2Absorbed;
	private String notes;
	private OffsetDateTime createdAt;
}
