package com.capston.project.back.end.response;

import com.capston.project.back.end.common.FarmStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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

	// Environment
	private String soilType;
	private String climateZone;
	private BigDecimal avgRainfall;
	private BigDecimal avgTemperature;

	// Status
	private FarmStatus farmStatus;

	// Stats (calculated from tree_batches)
	private Integer totalBatches;
	private Integer totalTrees;

	// Tracking
	private UUID createdBy;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
}
