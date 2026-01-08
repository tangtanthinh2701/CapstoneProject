package com.capston.project.back.end.scheduler;

import com.capston.project.back.end.service.CarbonCreditService;
import com.capston.project.back.end.service.OxiOwnershipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OwnershipAndCreditScheduler {

	private final OxiOwnershipService ownershipService;
	private final CarbonCreditService carbonCreditService;

	/**
	 * Kiểm tra ownership hết hạn - chạy mỗi ngày lúc 0:30 AM
	 */
	@Scheduled(cron = "0 30 0 * * ?")
	public void checkExpiredOwnerships() {
		log.info("Running scheduled task: Check expired ownerships");
		try {
			ownershipService. checkAndUpdateExpiredOwnerships();
		} catch (Exception e) {
			log.error("Failed to check expired ownerships:  {}", e.getMessage(), e);
		}
	}

	/**
	 * Kiểm tra carbon credits hết hạn - chạy mỗi ngày lúc 1:00 AM
	 */
	@Scheduled(cron = "0 0 1 * * ?")
	public void checkExpiredCredits() {
		log.info("Running scheduled task: Check expired carbon credits");
		try {
			carbonCreditService.checkAndUpdateExpiredCredits();
		} catch (Exception e) {
			log.error("Failed to check expired credits: {}", e.getMessage(), e);
		}
	}
}
