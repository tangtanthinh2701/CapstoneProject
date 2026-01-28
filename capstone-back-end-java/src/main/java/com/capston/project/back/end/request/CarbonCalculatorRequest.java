package com.capston.project.back.end.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonCalculatorRequest {
    @NotNull(message = "Tree species ID is required")
    private Integer treeSpeciesId;

    @NotNull(message = "Quantity of trees is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Years to estimate is required")
    @Min(value = 1, message = "Years must be at least 1")
    private Integer years;

    private BigDecimal environmentFactor;
}
