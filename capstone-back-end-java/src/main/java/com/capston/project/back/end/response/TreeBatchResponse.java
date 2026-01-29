package com.capston.project.back.end.response;

import com.capston.project.back.end.common.BatchStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeBatchResponse {
    private Integer id;
    private String batchCode;
    private Integer farmId;
    private String farmName; // Simplified
    private Integer treeSpeciesId;
    private String treeSpeciesName; // Simplified
    private Integer phaseId;
    private String phaseName; // Simplified
    private Integer quantityPlanted;
    private LocalDate plantingDate;
    private BigDecimal plantingAreaM2;
    private String supplierName;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private BatchStatus batchStatus;
    private String notes;
    private UUID createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
