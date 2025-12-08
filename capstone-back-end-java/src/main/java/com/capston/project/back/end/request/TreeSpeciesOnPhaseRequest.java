package com.capston.project.back.end.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeSpeciesOnPhaseRequest {
	@NotNull(message = "ID loài cây không được để trống")
	private Integer treeSpeciesId;

	@NotNull(message = "Số lượng dự kiến không được để trống")
	@Min(value = 1, message = "Số lượng phải lớn hơn 0")
	private Integer quantityPlanned;

	private BigDecimal costPerTree;

	private BigDecimal plantingCost;

	private BigDecimal maintenanceCostYearly;

	private String notes;
}
