package com.capston.project.back.end.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractTransferRequest {

    @NotNull(message = "Contract ID is required")
    private Integer contractId;

    @NotNull(message = "From user ID is required")
    private UUID fromUserId;

    @NotNull(message = "To user ID is required")
    private UUID toUserId;

    @DecimalMin(value = "0.01", message = "Transfer percentage must be greater than 0")
    @DecimalMax(value = "100.00", message = "Transfer percentage cannot exceed 100%")
    private BigDecimal transferPercentage;

    private BigDecimal transferPrice;

    private String notes;
}

