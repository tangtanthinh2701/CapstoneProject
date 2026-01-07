package com.capston.project.back.end.request;

import com.capston.project.back.end.common.FarmStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java. math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmRequest {
	@NotBlank(message = "Farm name is required")
	@Size(max = 255, message = "Name must not exceed 255 characters")
	private String name;

	private String description;

	@Size(max = 500, message = "Location must not exceed 500 characters")
	private String location;

	@DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
	@DecimalMax(value = "90.0", message = "Latitude must be <= 90")
	private BigDecimal latitude;

	@DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
	@DecimalMax(value = "180.0", message = "Longitude must be <= 180")
	private BigDecimal longitude;

	@NotNull(message = "Area is required")
	@DecimalMin(value = "0.01", message = "Area must be positive")
	private BigDecimal area;

	private BigDecimal usableArea;

	@Size(max = 100)
	private String soilType;

	@Size(max = 100)
	private String climateZone;

	private BigDecimal avgRainfall;

	private BigDecimal avgTemperature;

	private FarmStatus farmStatus;

	private LocalDate plantingDate;
}
