package com.capston.project.back.end.service;

import java.math.BigDecimal;

/**
 * Service for geocoding addresses to coordinates
 * Integrates with Google Maps Geocoding API or OpenStreetMap Nominatim
 */
public interface GeocodingService {

    /**
     * Get coordinates (latitude, longitude) from address
     * @param address Full address string
     * @return Coordinates object with lat/lng
     */
    Coordinates getCoordinates(String address);

    /**
     * Reverse geocoding: Get address from coordinates
     * @param latitude
     * @param longitude
     * @return Formatted address
     */
    String getAddress(BigDecimal latitude, BigDecimal longitude);

    /**
     * DTO for coordinates
     */
    record Coordinates(BigDecimal latitude, BigDecimal longitude, String formattedAddress) {}
}

