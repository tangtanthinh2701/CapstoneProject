package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.service.SoilApiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Implementation using SoilGrids REST API (ISRIC)
 * Free API: https://rest.isric.org/soilgrids/v2.0
 */
@Service
@Slf4j
public class SoilApiServiceImpl implements SoilApiService {

    @Value("${soil.use-mock:true}")
    private boolean useMock;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public SoilData getSoilProperties(BigDecimal latitude, BigDecimal longitude) {
        if (useMock) {
            return getMockSoilData(latitude, longitude);
        }

        try {
            // Get soil classification
            String classUrl = UriComponentsBuilder
                    .fromUriString("https://rest.isric.org/soilgrids/v2.0/classification")
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("number_classes", 5)
                    .toUriString();

            Map<String, Object> classResponse = restTemplate.getForObject(classUrl, Map.class);

            String soilType = "Unknown";
            if (classResponse != null) {
                soilType = (String) classResponse.get("wrb_class_name");
            }

            // Get soil properties (pH, organic carbon)
            String propUrl = UriComponentsBuilder
                    .fromUriString("https://rest.isric.org/soilgrids/v2.0/properties/query")
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("property", "phh2o")
                    .queryParam("depth", "0-5cm")
                    .toUriString();

            Map<String, Object> propResponse = restTemplate.getForObject(propUrl, Map.class);

            BigDecimal ph = new BigDecimal("6.5"); // Default
            if (propResponse != null) {
                var properties = (Map<String, Object>) propResponse.get("properties");
                var phData = (Map<String, Object>) properties.get("phh2o");
                ph = new BigDecimal(phData.get("mean").toString()).divide(new BigDecimal("10"), 2, RoundingMode.HALF_UP);
            }

            log.info("Fetched soil data for {}, {}: {}", latitude, longitude, soilType);
            return new SoilData(soilType, ph, new BigDecimal("2.5"), "Loam");

        } catch (Exception e) {
            log.error("Error fetching soil data: {}", e.getMessage());
            return getMockSoilData(latitude, longitude);
        }
    }

    @Override
    public String getSoilType(BigDecimal latitude, BigDecimal longitude) {
        SoilData data = getSoilProperties(latitude, longitude);
        return data.soilType();
    }

    // ==================== MOCK DATA ====================

    private SoilData getMockSoilData(BigDecimal latitude, BigDecimal longitude) {
        double lat = latitude.doubleValue();

        String soilType;
        BigDecimal ph;
        String texture;

        // Highland soils (Đà Lạt)
        if (lat > 11 && lat < 12 && longitude.doubleValue() > 108 && longitude.doubleValue() < 109) {
            soilType = "Acrisols (Đất phù sa chua)";
            ph = new BigDecimal("5.8");
            texture = "Sandy loam";
        }
        // North Vietnam - Red-yellow soils
        else if (lat > 20) {
            soilType = "Acrisols (Đất đỏ vàng)";
            ph = new BigDecimal("5.5");
            texture = "Clay loam";
        }
        // Central Vietnam - Sandy soils
        else if (lat > 15) {
            soilType = "Arenosols (Đất cát)";
            ph = new BigDecimal("6.2");
            texture = "Sandy";
        }
        // South Vietnam - Alluvial soils
        else {
            soilType = "Fluvisols (Đất phù sa)";
            ph = new BigDecimal("6.8");
            texture = "Loam";
        }

        BigDecimal organicCarbon = new BigDecimal(1.5 + Math.random() * 2).setScale(2, RoundingMode.HALF_UP);

        return new SoilData(soilType, ph, organicCarbon, texture);
    }
}

