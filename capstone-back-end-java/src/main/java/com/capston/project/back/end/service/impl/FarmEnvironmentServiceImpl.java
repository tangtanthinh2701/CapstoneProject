package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.entity.Farm;
import com.capston.project.back.end.entity.FarmEnvironmentRecord;
import com.capston.project.back.end.repository.FarmEnvironmentRecordRepository;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.service.FarmEnvironmentService;
import com.capston.project.back.end.service.SoilApiService;
import com.capston.project.back.end.service.WeatherApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FarmEnvironmentServiceImpl implements FarmEnvironmentService {

    private final FarmRepository farmRepository;
    private final FarmEnvironmentRecordRepository recordRepository;
    private final WeatherApiService weatherApiService;
    private final SoilApiService soilApiService;

    @Override
    @Transactional
    public void fetchAndSaveForAllFarms(LocalDate date) {
        log.info("Fetching environment data for all active farms for date: {}", date);
        List<Farm> activeFarms = farmRepository.findAllActive();

        for (Farm farm : activeFarms) {
            try {
                fetchAndSaveForFarm(farm, date);
            } catch (Exception e) {
                log.error("Failed to fetch environment data for farm {}: {}", farm.getCode(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void fetchAndSaveForFarm(Integer farmId, LocalDate date) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new IllegalArgumentException("Farm not found with id: " + farmId));
        fetchAndSaveForFarm(farm, date);
    }

    private void fetchAndSaveForFarm(Farm farm, LocalDate date) {
        if (farm.getLatitude() == null || farm.getLongitude() == null) {
            log.warn("Farm {} has no coordinates, skipping environment record", farm.getCode());
            return;
        }

        // Check if record already exists
        if (recordRepository.findByFarmIdAndDate(farm.getId(), date).isPresent()) {
            log.info("Record already exists for farm {} on {}, skipping", farm.getCode(), date);
            return;
        }

        log.debug("Fetching environment record for farm {} on {}", farm.getCode(), date);

        // Fetch weather data
        WeatherApiService.WeatherData weatherData = weatherApiService.getHistoricalWeather(
                farm.getLatitude(), farm.getLongitude(), date);

        // Fetch soil data (pH is usually stable, but we'll fetch current state)
        SoilApiService.SoilData soilData = soilApiService.getSoilProperties(
                farm.getLatitude(), farm.getLongitude());

        FarmEnvironmentRecord record = FarmEnvironmentRecord.builder()
                .farmId(farm.getId())
                .recordedDate(date)
                .rainfallMm(weatherData.rainfall())
                .temperatureC(weatherData.temperature())
                .soilPh(soilData.ph())
                .soilMoisturePercent(weatherData.humidity()) // We can use humidity as proxy for moisture if needed
                // Factors will be calculated in @PrePersist/@PreUpdate
                .build();

        recordRepository.save(record);
        log.info("Saved environment record for farm {} on {}", farm.getCode(), date);
    }
}
