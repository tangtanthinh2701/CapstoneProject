package com.capston.project.back.end.scheduler;

import com.capston.project.back.end.service.FarmEnvironmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Slf4j
@RequiredArgsConstructor
public class FarmEnvironmentScheduler {

    private final FarmEnvironmentService farmEnvironmentService;

    /**
     * Fetch yesterday's environment data for all farms every day at 02:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void fetchDailyEnvironmentRecords() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Starting scheduled task: fetching environment records for {}", yesterday);
        farmEnvironmentService.fetchAndSaveForAllFarms(yesterday);
        log.info("Scheduled task finished: fetching environment records for {}", yesterday);
    }
}
