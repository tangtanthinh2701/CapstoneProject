package com.capston.project.back.end.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeSpeciesResponse {
	private Integer id;
	private String name;
	private String scientificName;
	private BigDecimal carbonAbsorptionRate;
	private String description;
	private String imageUrl;
	private BigDecimal typicalHeight;
	private BigDecimal typicalDiameter;
	private Integer typicalLifespan;
	private String growthRate;
	private List<String> climateZones;
	private List<String> soilTypes;
	private String waterRequirement;
	private String sunlightRequirement;
	private BigDecimal woodValue;
	private BigDecimal fruitValue;
	private Boolean hasCommercialValue;
	private Boolean isActive;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
