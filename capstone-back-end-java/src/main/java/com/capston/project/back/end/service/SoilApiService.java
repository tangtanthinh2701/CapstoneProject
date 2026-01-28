package com.capston.project.back.end.service;

import java.math.BigDecimal;

/**
 * Service for fetching soil data
 * Integrates with SoilGrids REST API (ISRIC)
 */
public interface SoilApiService {

    /**
     * Get soil properties for a location
     * @param latitude
     * @param longitude
     * @return Soil data
     */
    SoilData getSoilProperties(BigDecimal latitude, BigDecimal longitude);

    /**
     * Get soil type classification
     * @param latitude
     * @param longitude
     * @return Soil type name (e.g., "Acrisols")
     */
    String getSoilType(BigDecimal latitude, BigDecimal longitude);

    /**
     * DTO for soil data
     */
    record SoilData(
            String soilType, // WRB classification
            BigDecimal ph, // Soil pH
            BigDecimal organicCarbon, // %
            String texture // e.g., "Clay loam"
    ) {}
}

