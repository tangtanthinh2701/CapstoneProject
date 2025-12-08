package com.capston.project.back.end.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectListResponse {
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
	private Boolean isPublic;
}
