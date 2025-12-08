package com.capston.project.back.end.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeSpeciesSimpleResponse {
	private Integer id;
	private String name;
	private String scientificName;
	private BigDecimal carbonAbsorptionRate;
}
