package com.capston.project.back.end.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeSpeciesRequest {
	private Integer id;

	@NotBlank(message = "Tree name is required")
	@Size(max = 255, message = "Name must not exceed 255 characters")
	private String name;

	@Size(max = 255, message = "Scientific name must not exceed 255 characters")
	private String scientificName;

	@NotNull(message = "Carbon absorption rate is required")
	@DecimalMin(value = "0.0001", message = "Carbon absorption rate must be positive")
	private BigDecimal carbonAbsorptionRate;

	@Size(max = 5000, message = "Description is too long")
	private String description;

	@Size(max = 500, message = "Image URL is too long")
	private String imageUrl;

	@DecimalMin(value = "0.0", message = "Height must be positive")
	private BigDecimal typicalHeight;

	@DecimalMin(value = "0.0", message = "Diameter must be positive")
	private BigDecimal typicalDiameter;

	@Min(value = 1, message = "Lifespan must be at least 1 year")
	private Integer typicalLifespan;

	@Pattern(regexp = "SLOW|MEDIUM|FAST", message = "Growth rate must be SLOW, MEDIUM, or FAST")
	private String growthRate;

	private List<String> climateZones;

	private List<String> soilTypes;

	@Pattern(regexp = "LOW|MEDIUM|HIGH", message = "Water requirement must be LOW, MEDIUM, or HIGH")
	private String waterRequirement;

	@Pattern(regexp = "FULL_SUN|PARTIAL_SHADE|SHADE",
	         message = "Sunlight requirement must be FULL_SUN, PARTIAL_SHADE, or SHADE")
	private String sunlightRequirement;

	@DecimalMin(value = "0.0", message = "Wood value must be positive")
	private BigDecimal woodValue;

	@DecimalMin(value = "0.0", message = "Fruit value must be positive")
	private BigDecimal fruitValue;

	private Boolean hasCommercialValue = false;

	private Boolean isActive = true;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	//  SEARCH/FILTER FIELDS (Dùng khi gọi API Search)
	private String keyword; // Tìm theo tên hoặc tên khoa học

	// Range filters
	private BigDecimal minCarbonRate;
	private BigDecimal maxCarbonRate;
	private Integer minLifespan;
	private Integer maxLifespan;

	// Pagination
	@Builder.Default
	private Integer page = 0;

	@Builder.Default
	private Integer size = 20;

	@Builder.Default
	private String sortBy = "name";

	@Builder.Default
	private String sortDirection = "ASC";

	// STATISTICS FIELDS (Dùng khi gọi API Statistics)
	@NotNull(message = "Expected quantity must not be empty")
	@Min(value = 1, message = "Quantity must be greater than 0")
	private Integer quantityPlanned;
	private Integer quantityActual;
	private Integer quantityDied;
	private BigDecimal costPerTree;
	private BigDecimal plantingCost;
	private BigDecimal maintenanceCostYearly;
	private String notes;

	// Counts
	private Long totalSpecies;
	private Long activeSpecies;
	private Long inactiveSpecies;
	private Long commercialSpecies;

	// Carbon statistics
	private BigDecimal avgCarbonAbsorptionRate;
	private BigDecimal maxCarbonAbsorptionRate;
	private BigDecimal minCarbonAbsorptionRate;

	// Growth rate distribution
	private Map<String, Long> growthRateDistribution;
	// {"SLOW": 10, "MEDIUM": 20, "FAST": 15}

	// Economic statistics
	private BigDecimal totalWoodValue;
	private BigDecimal avgWoodValue;
	private BigDecimal totalFruitValue;
	private BigDecimal avgFruitValue;

	public interface Create {}
	public interface Update {}
}
