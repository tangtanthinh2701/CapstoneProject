package com.capston.project.back.end.response;

import com.capston.project.back.end.common.FarmStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmResponse {
	private Integer id;
	private String code;
	private String name;
	private String description;

	// Location
	private String location;
	private BigDecimal latitude;
	private BigDecimal longitude;

	// Area
	private BigDecimal area;
	private BigDecimal usableArea;

	// Tree stats
	private Integer totalTrees;
	private Integer aliveTrees;
	private Integer deadTrees;
	private Integer availableTreesForSale; // Số cây có thể bán

	// Environment
	private String soilType;
	private String climateZone;
	private BigDecimal avgRainfall;
	private BigDecimal avgTemperature;

	// Status
	private FarmStatus farmStatus;
	private LocalDate plantingDate;

	// Carbon stats
	private BigDecimal totalEstimatedCarbon;   // Tổng CO2 ước tính
	private BigDecimal totalAbsorbedCarbon;    // Tổng CO2 đã hấp thụ

	// Tracking
	private UUID createdBy;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

	// Related data
	private List<TreesFarmResponse> treesFarms;
	private Integer totalSpecies; // Số loại cây
}
