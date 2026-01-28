package com.capston.project.back.end.service;

import java.time.LocalDate;

public interface FarmEnvironmentService {
    /**
     * Fetch environment data for all active farms for a specific date
     */
    void fetchAndSaveForAllFarms(LocalDate date);

    /**
     * Fetch environment data for a specific farm and date
     */
    void fetchAndSaveForFarm(Integer farmId, LocalDate date);
}
