package com.capston.project.back.end.service;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Service for fetching weather and climate data
 * Integrates with OpenWeatherMap, NASA POWER API, WorldClim
 */
public interface WeatherApiService {

    /**
     * Get historical weather data for a specific date
     * @param latitude
     * @param longitude
     * @param date Date to fetch data for
     * @return Weather data
     */
    WeatherData getHistoricalWeather(BigDecimal latitude, BigDecimal longitude, LocalDate date);

    /**
     * Get climate statistics (average rainfall, temperature)
     * @param latitude
     * @param longitude
     * @return Climate data
     */
    ClimateData getClimateData(BigDecimal latitude, BigDecimal longitude);

    /**
     * Get climate zone based on coordinates and temperature
     * @param latitude
     * @param longitude
     * @param avgTemperature
     * @return Climate zone name (e.g., "Subtropical Highland")
     */
    String getClimateZone(BigDecimal latitude, BigDecimal longitude, BigDecimal avgTemperature);

    /**
     * DTO for daily weather data
     */
    record WeatherData(
            LocalDate date,
            BigDecimal rainfall, // mm
            BigDecimal temperature, // Celsius
            BigDecimal humidity // %
    ) {}

    /**
     * DTO for climate statistics
     */
    record ClimateData(
            BigDecimal avgRainfall, // mm/year
            BigDecimal avgTemperature, // Celsius
            BigDecimal rainfall7Days, // For soil moisture calculation
            String climateZone
    ) {}
}

