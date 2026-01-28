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
public class TreeSpeciesResponse {
	private Integer id;
	private String name;
	private String scientificName;
	private BigDecimal baseCarbonRate;
	private BigDecimal carbonAbsorptionRate;
	private String description;
	private String imageUrl;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

	// Computed
	private BigDecimal estimatedCarbonPerYear; // = carbonAbsorptionRate
	private BigDecimal estimatedCarbon5Years;
	private BigDecimal estimatedCarbon10Years;
}
