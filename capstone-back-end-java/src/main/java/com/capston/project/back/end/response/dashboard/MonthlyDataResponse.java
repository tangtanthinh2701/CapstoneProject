package com.capston.project.back.end.response.dashboard;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyDataResponse {
	private Integer year;
	private Integer month;
	private String monthName;
	private BigDecimal value;
	private Long count;
}
