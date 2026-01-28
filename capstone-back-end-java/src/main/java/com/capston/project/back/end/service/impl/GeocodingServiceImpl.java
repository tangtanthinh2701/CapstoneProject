package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.service.GeocodingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Implementation using Google Maps Geocoding API
 * Alternative: OpenStreetMap Nominatim (free but rate-limited)
 */
@Service
@Slf4j
public class GeocodingServiceImpl implements GeocodingService {

    @Value("${google.maps.api.key:AIzaSyDummyKeyForDevelopment}")
    private String googleMapsApiKey;

    @Value("${geocoding.use-mock:true}")
    private boolean useMock;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Coordinates getCoordinates(String address) {
        if (useMock) {
            return getMockCoordinates(address);
        }

        try {
            // Use OpenStreetMap Nominatim Geocoding - FREE!
            String url = UriComponentsBuilder
                    .fromUriString("https://nominatim.openstreetmap.org/search")
                    .queryParam("q", address)
                    .queryParam("format", "json")
                    .queryParam("limit", 1)
                    .toUriString();

            // Set User-Agent as required by Nominatim Policy
            restTemplate.getInterceptors().clear();
            restTemplate.getInterceptors().add((request, body, execution) -> {
                request.getHeaders().add("User-Agent", "CarbonCreditApp/1.0 (Educational Project)");
                return execution.execute(request, body);
            });

            java.util.List<Map<String, Object>> response = restTemplate.getForObject(url, java.util.List.class);

            if (response != null && !response.isEmpty()) {
                Map<String, Object> firstResult = response.get(0);
                BigDecimal lat = new BigDecimal(firstResult.get("lat").toString());
                BigDecimal lng = new BigDecimal(firstResult.get("lon").toString());
                String formattedAddress = (String) firstResult.get("display_name");

                log.info("Geocoded address '{}' to coordinates: {}, {}", address, lat, lng);
                return new Coordinates(lat, lng, formattedAddress);
            }

            // Fallback to Google Maps if configured and OSM fails
            if (!"AIzaSyDummyKeyForDevelopment".equals(googleMapsApiKey)) {
                return getCoordinatesFromGoogle(address);
            }

            log.warn("Failed to geocode address: {}. Using mock data.", address);
            return getMockCoordinates(address);

        } catch (Exception e) {
            log.error("Error geocoding address: {}", address, e);
            return getMockCoordinates(address);
        }
    }

    private Coordinates getCoordinatesFromGoogle(String address) {
        try {
            String url = UriComponentsBuilder
                    .fromUriString("https://maps.googleapis.com/maps/api/geocode/json")
                    .queryParam("address", address)
                    .queryParam("key", googleMapsApiKey)
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "OK".equals(response.get("status"))) {
                var results = (java.util.List<?>) response.get("results");
                if (results != null && !results.isEmpty()) {
                    var firstResult = (Map<String, Object>) results.get(0);
                    var geometry = (Map<String, Object>) firstResult.get("geometry");
                    var location = (Map<String, Object>) geometry.get("location");
                    var formattedAddress = (String) firstResult.get("formatted_address");

                    BigDecimal lat = new BigDecimal(location.get("lat").toString());
                    BigDecimal lng = new BigDecimal(location.get("lng").toString());

                    return new Coordinates(lat, lng, formattedAddress);
                }
            }
        } catch (Exception e) {
            log.error("Google Maps fallback failed", e);
        }
        return getMockCoordinates(address);
    }

    @Override
    public String getAddress(BigDecimal latitude, BigDecimal longitude) {
        if (useMock) {
            return "Mock Address at " + latitude + ", " + longitude;
        }

        try {
            // OpenStreetMap Nominatim Reverse Geocoding - FREE!
            String url = UriComponentsBuilder
                    .fromUriString("https://nominatim.openstreetmap.org/reverse")
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("format", "json")
                    .toUriString();

            // Set User-Agent header
            restTemplate.getInterceptors().clear();
            restTemplate.getInterceptors().add((request, body, execution) -> {
                request.getHeaders().add("User-Agent", "CarbonCreditApp/1.0 (Educational Project)");
                return execution.execute(request, body);
            });

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("display_name")) {
                return (String) response.get("display_name");
            }

            return "Unknown location";

        } catch (Exception e) {
            log.error("Error reverse geocoding: {}, {}", latitude, longitude, e);
            return "Unknown location";
        }
    }

    /**
     * Mock data for development/testing
     */
    private Coordinates getMockCoordinates(String address) {
        String lowerAddress = address.toLowerCase();

        if (lowerAddress.contains("đà lạt") || lowerAddress.contains("da lat")) {
            return new Coordinates(
                    new BigDecimal("11.940419"),
                    new BigDecimal("108.458313"),
                    "Đà Lạt, Lâm Đồng, Vietnam");
        } else if (lowerAddress.contains("hồ chí minh") || lowerAddress.contains("ho chi minh")
                || lowerAddress.contains("saigon")) {
            return new Coordinates(
                    new BigDecimal("10.762622"),
                    new BigDecimal("106.660172"),
                    "Ho Chi Minh City, Vietnam");
        } else if (lowerAddress.contains("hà nội") || lowerAddress.contains("ha noi")
                || lowerAddress.contains("hanoi")) {
            return new Coordinates(
                    new BigDecimal("21.028511"),
                    new BigDecimal("105.804817"),
                    "Hanoi, Vietnam");
        } else if (lowerAddress.contains("đà nẵng") || lowerAddress.contains("da nang")) {
            return new Coordinates(
                    new BigDecimal("16.047079"),
                    new BigDecimal("108.206230"),
                    "Da Nang, Vietnam");
        } else {
            // Default to central Vietnam
            return new Coordinates(
                    new BigDecimal("15.0")
                            .add(new BigDecimal(Math.random()).multiply(new BigDecimal("5.0"))),
                    new BigDecimal("105.0")
                            .add(new BigDecimal(Math.random()).multiply(new BigDecimal("5.0"))),
                    "Vietnam");
        }
    }
}
