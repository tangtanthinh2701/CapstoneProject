package com.capston.project.back.end.response.dashboard;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportFilterRequest {
	private LocalDate fromDate;
	private LocalDate toDate;
	private List<Integer> projectIds;
	private List<Integer> farmIds;
	private Integer year;
	private Integer month;
	private String groupBy; // DAY, WEEK, MONTH, QUARTER, YEAR
}
