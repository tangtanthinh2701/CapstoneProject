package com.capston.project.back.end.request;

import com.capston.project.back.end.common.FarmStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
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

	@NotNull(message = "Area is required")
	@DecimalMin(value = "0.01", message = "Area must be positive")
	private BigDecimal area;

	private BigDecimal usableArea;

	private FarmStatus farmStatus;

	private LocalDate plantingDate;
}
