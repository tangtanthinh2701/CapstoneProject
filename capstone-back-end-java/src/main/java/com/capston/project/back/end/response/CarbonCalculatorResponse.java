package com.capston.project.back.end.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonCalculatorResponse {
    private String speciesName;
    private BigDecimal baseCarbonRate;
    private Integer quantity;
    private Integer years;
    private BigDecimal environmentFactorUsed;

    private BigDecimal estimatedTotalCO2Kg;
    private BigDecimal estimatedTotalCO2Tons;
    private BigDecimal estimatedTotalCredits;

    private Map<Integer, BigDecimal> yearlyBreakdownKg;
}
