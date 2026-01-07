package com.capston.project.back.end.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeSpeciesRequest {
	@NotBlank(message = "Tree species name is required")
	@Size(max = 255, message = "Name must not exceed 255 characters")
	private String name;

	@Size(max = 255, message = "Scientific name must not exceed 255 characters")
	private String scientificName;

	@NotNull(message = "Carbon absorption rate is required")
	@DecimalMin(value = "0.0001", message = "Carbon absorption rate must be positive")
	private BigDecimal carbonAbsorptionRate;

	private String description;

	@Size(max = 500, message = "Image URL must not exceed 500 characters")
	private String imageUrl;
}
