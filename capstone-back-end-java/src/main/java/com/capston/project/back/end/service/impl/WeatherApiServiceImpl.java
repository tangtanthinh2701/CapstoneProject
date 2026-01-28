package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.service.WeatherApiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Map;

/**
 * Implementation using OpenWeatherMap & NASA POWER API
 * For production: sign up for API keys
 */
@Service
@Slf4j
public class WeatherApiServiceImpl implements WeatherApiService {

    @Value("${openweathermap.api.key:dummy_key}")
    private String openWeatherMapApiKey;

    @Value("${weather.use-mock:true}")
    private boolean useMock;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public WeatherData getHistoricalWeather(BigDecimal latitude, BigDecimal longitude, LocalDate date) {
        if (useMock) {
            return getMockWeatherData(latitude, longitude, date);
        }

        try {
            // Use Open-Meteo Historical Weather API - FREE!
            String url = UriComponentsBuilder
                    .fromUriString("https://archive-api.open-meteo.com/v1/archive")
                    .queryParam("latitude", latitude)
                    .queryParam("longitude", longitude)
                    .queryParam("start_date", date.toString())
                    .queryParam("end_date", date.toString())
                    .queryParam("daily", "precipitation_sum,temperature_2m_mean")
                    .queryParam("timezone", "Asia/Bangkok")
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("daily")) {
                var daily = (Map<String, Object>) response.get("daily");
                var precipitationList = (java.util.List<?>) daily.get("precipitation_sum");
                var temperatureList = (java.util.List<?>) daily.get("temperature_2m_mean");

                if (!precipitationList.isEmpty() && !temperatureList.isEmpty()) {
                    BigDecimal rainfall = new BigDecimal(precipitationList.get(0).toString());
                    BigDecimal temp = new BigDecimal(temperatureList.get(0).toString());

                    log.info("Fetched historical weather from Open-Meteo for {}, {} on {}", latitude, longitude, date);
                    return new WeatherData(date, rainfall, temp, new BigDecimal("70"));
                }
            }

            return getMockWeatherData(latitude, longitude, date);

        } catch (Exception e) {
            log.error("Error fetching historical weather data: {}", e.getMessage());
            return getMockWeatherData(latitude, longitude, date);
        }
    }

    @Override
    public ClimateData getClimateData(BigDecimal latitude, BigDecimal longitude) {
        if (useMock) {
            return getMockClimateData(latitude, longitude);
        }

        try {
            // Open-Meteo Climate Statistics API - FREE!
            // Get last year's data as climate average
            LocalDate endDate = LocalDate.now().minusDays(1);
            LocalDate startDate = endDate.minusYears(1);

            String url = UriComponentsBuilder
                    .fromUriString("https://archive-api.open-meteo.com/v1/archive")
                    .queryParam("latitude", latitude)
                    .queryParam("longitude", longitude)
                    .queryParam("start_date", startDate.toString())
                    .queryParam("end_date", endDate.toString())
                    .queryParam("daily", "precipitation_sum,temperature_2m_mean")
                    .queryParam("timezone", "Asia/Bangkok")
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("daily")) {
                var daily = (Map<String, Object>) response.get("daily");
                var precipitationList = (java.util.List<?>) daily.get("precipitation_sum");
                var temperatureList = (java.util.List<?>) daily.get("temperature_2m_mean");

                // Calculate averages
                double totalRainfall = precipitationList.stream()
                        .mapToDouble(p -> Double.parseDouble(p.toString()))
                        .sum();

                double avgTemp = temperatureList.stream()
                        .mapToDouble(t -> Double.parseDouble(t.toString()))
                        .average()
                        .orElse(25.0);

                // Convert to yearly rainfall
                BigDecimal avgRainfall = new BigDecimal(totalRainfall).setScale(2, RoundingMode.HALF_UP);
                BigDecimal avgTemperature = new BigDecimal(avgTemp).setScale(2, RoundingMode.HALF_UP);

                // Calculate recent 7 days rainfall for soil moisture
                double rainfall7Days = precipitationList.subList(
                        Math.max(0, precipitationList.size() - 7),
                        precipitationList.size()).stream().mapToDouble(p -> Double.parseDouble(p.toString())).sum();

                String climateZone = getClimateZone(latitude, longitude, avgTemperature);

                log.info("Fetched climate data for {}, {} using Open-Meteo", latitude, longitude);
                return new ClimateData(avgRainfall, avgTemperature, new BigDecimal(rainfall7Days), climateZone);
            }

            return getMockClimateData(latitude, longitude);

        } catch (Exception e) {
            log.error("Error fetching climate data: {}", e.getMessage());
            return getMockClimateData(latitude, longitude);
        }
    }

    @Override
    public String getClimateZone(BigDecimal latitude, BigDecimal longitude, BigDecimal avgTemperature) {
        // Simple classification based on latitude and temperature
        double lat = latitude.doubleValue();
        double temp = avgTemperature.doubleValue();

        if (lat > 1500 || temp < 15) {
            return "Temperate Highland";
        } else if (temp >= 15 && temp < 25) {
            return "Subtropical";
        } else if (temp >= 25) {
            return "Tropical";
        } else {
            return "Temperate";
        }
    }

    // ==================== MOCK DATA ====================

    private WeatherData getMockWeatherData(BigDecimal latitude, BigDecimal longitude, LocalDate date) {
        // Simulate seasonal variation
        int month = date.getMonthValue();
        double lat = latitude.doubleValue();

        BigDecimal rainfall;
        BigDecimal temperature;

        // Rainy season (May-October in Vietnam)
        if (month >= 5 && month <= 10) {
            rainfall = new BigDecimal(5 + Math.random() * 15).setScale(2, RoundingMode.HALF_UP);
        } else {
            rainfall = new BigDecimal(1 + Math.random() * 5).setScale(2, RoundingMode.HALF_UP);
        }

        // Temperature varies by latitude
        if (lat > 20) { // North Vietnam
            temperature = new BigDecimal(20 + Math.random() * 10).setScale(2, RoundingMode.HALF_UP);
        } else if (lat > 15) { // Central Vietnam
            temperature = new BigDecimal(25 + Math.random() * 8).setScale(2, RoundingMode.HALF_UP);
        } else { // South Vietnam
            temperature = new BigDecimal(27 + Math.random() * 5).setScale(2, RoundingMode.HALF_UP);
        }

        // Highland adjustment (Đà Lạt)
        if (lat > 11 && lat < 12 && longitude.doubleValue() > 108 && longitude.doubleValue() < 109) {
            temperature = new BigDecimal(15 + Math.random() * 8).setScale(2, RoundingMode.HALF_UP);
        }

        return new WeatherData(date, rainfall, temperature, new BigDecimal("70"));
    }

    private ClimateData getMockClimateData(BigDecimal latitude, BigDecimal longitude) {
        double lat = latitude.doubleValue();

        BigDecimal avgRainfall;
        BigDecimal avgTemperature;

        // Highland (Đà Lạt area)
        if (lat > 11 && lat < 12 && longitude.doubleValue() > 108 && longitude.doubleValue() < 109) {
            avgRainfall = new BigDecimal("1800.50");
            avgTemperature = new BigDecimal("18.50");
        }
        // North Vietnam
        else if (lat > 20) {
            avgRainfall = new BigDecimal("1600.00");
            avgTemperature = new BigDecimal("23.50");
        }
        // Central Vietnam
        else if (lat > 15) {
            avgRainfall = new BigDecimal("2200.00");
            avgTemperature = new BigDecimal("26.00");
        }
        // South Vietnam
        else {
            avgRainfall = new BigDecimal("2000.00");
            avgTemperature = new BigDecimal("27.50");
        }

        String climateZone = getClimateZone(latitude, longitude, avgTemperature);

        return new ClimateData(avgRainfall, avgTemperature, new BigDecimal("50"), climateZone);
    }
}
