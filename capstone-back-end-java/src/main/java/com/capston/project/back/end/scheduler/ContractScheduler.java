package com.capston.project.back.end.scheduler;

import com.capston.project.back.end.service.ContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ContractScheduler {

	private final ContractService contractService;

	/**
	 * Kiểm tra hợp đồng sắp hết hạn - chạy mỗi ngày lúc 8:00 AM
	 */
	@Scheduled(cron = "0 0 8 * * ? ")
	public void checkExpiringSoonContracts() {
		log.info("Running scheduled task: Check expiring soon contracts");
		try {
			contractService.checkAndUpdateExpiringSoonContracts();
		} catch (Exception e) {
			log.error("Failed to check expiring soon contracts:  {}", e.getMessage(), e);
		}
	}

	/**
	 * Kiểm tra hợp đồng đã hết hạn - chạy mỗi ngày lúc 0:00 AM
	 */
	@Scheduled(cron = "0 0 0 * * ?")
	public void checkExpiredContracts() {
		log.info("Running scheduled task: Check expired contracts");
		try {
			contractService.checkAndUpdateExpiredContracts();
		} catch (Exception e) {
			log.error("Failed to check expired contracts: {}", e. getMessage(), e);
		}
	}

	/**
	 * Xử lý tự động gia hạn - chạy mỗi ngày lúc 9:00 AM
	 */
	@Scheduled(cron = "0 0 9 * * ?")
	public void processAutoRenewals() {
		log.info("Running scheduled task: Process auto renewals");
		try {
			contractService.processAutoRenewals();
		} catch (Exception e) {
			log.error("Failed to process auto renewals: {}", e.getMessage(), e);
		}
	}
}
