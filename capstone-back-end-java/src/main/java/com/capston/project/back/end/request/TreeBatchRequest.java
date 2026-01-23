package com.capston.project.back.end.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreeBatchRequest {

    @NotNull(message = "Farm ID is required")
    private Integer farmId;

    @NotNull(message = "Tree species ID is required")
    private Integer treeSpeciesId;

    private Integer phaseId;

    @NotNull(message = "Quantity planted is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantityPlanted;

    @NotNull(message = "Planting date is required")
    private LocalDate plantingDate;

    private BigDecimal plantingAreaM2;

    private String supplierName;
    private BigDecimal unitCost;
    private BigDecimal totalCost;

    private String notes;
    private UUID createdBy;
}

