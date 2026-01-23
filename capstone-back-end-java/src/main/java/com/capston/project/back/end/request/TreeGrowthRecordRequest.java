package com.capston.project.back.end.request;

import com.capston.project.back.end.common.HealthStatus;
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
public class TreeGrowthRecordRequest {

    @NotNull(message = "Batch ID is required")
    private Integer batchId;

    @NotNull(message = "Recorded date is required")
    private LocalDate recordedDate;

    @NotNull(message = "Quantity alive is required")
    @Min(value = 0, message = "Quantity alive cannot be negative")
    private Integer quantityAlive;

    @Min(value = 0, message = "Quantity dead cannot be negative")
    private Integer quantityDead;

    private BigDecimal avgHeightCm;
    private BigDecimal avgTrunkDiameterCm;
    private BigDecimal avgCanopyDiameterCm;

    private HealthStatus healthStatus; // HEALTHY, DISEASED, STRESSED

    private String healthNotes;

    private UUID recordedBy;

    // Optional: manually set environment factor (if not auto-calculated)
    private BigDecimal environmentFactor;
}
