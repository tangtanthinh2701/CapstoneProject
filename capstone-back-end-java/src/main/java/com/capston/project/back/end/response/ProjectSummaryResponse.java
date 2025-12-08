package com.capston.project.back.end.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectSummaryResponse {
	private Integer id;
	private String code;
	private String name;
	private String locationText;
	private BigDecimal area;
	private String areaUnit;
	private Integer totalTreesPlanned;
	private Integer totalTreesActual;
	private String projectStatus;

	private LocalDate plantingDate;

	private Integer treeSpeciesCount;
	private List<String> treeSpeciesNames;
}
