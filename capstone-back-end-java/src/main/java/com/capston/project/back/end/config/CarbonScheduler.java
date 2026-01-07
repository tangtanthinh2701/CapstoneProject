package com.capston.project.back.end.config;

import com.capston.project.back.end.entity.TreesFarm;
import com.capston.project.back.end.repository.CarbonReserveRepository;
import com.capston.project.back.end.repository.FarmEnvironmentFactorRepository;
import com.capston.project.back.end.repository.TreesFarmRepository;
import com.capston.project.back.end.service.FarmService;
import com.capston.project.back.end.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org. springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time. OffsetDateTime;
import java. util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CarbonScheduler {
	private final TreesFarmRepository treesFarmRepository;
	private final FarmEnvironmentFactorRepository environmentFactorRepository;
	private final CarbonReserveRepository carbonReserveRepository;
	private final FarmService farmService;
	private final ProjectService projectService;

	/**
	 * Cập nhật CO2 hấp thụ cho tất cả cây hàng ngày lúc 1:00 AM
	 */
	@Scheduled(cron = "0 0 1 * * ? ")
	@Transactional
	public void dailyUpdateCarbonAbsorption() {
		log.info("Starting daily carbon absorption update.. .");

		try {
			List<Integer> aliveTreeIds = treesFarmRepository.findAllAliveIds();
			int updated = 0;

			for (Integer treesFarmId : aliveTreeIds) {
				try {
					TreesFarm treesFarm = treesFarmRepository.findByIdWithDetails(treesFarmId).orElse(null);
					if (treesFarm == null) continue;

					// Get environmental factor
					BigDecimal envFactor = environmentFactorRepository
							.getAverageFactorByFarmId(treesFarm.getFarmId());

					// Calculate absorbed carbon
					BigDecimal carbonPerTree = treesFarm.getTreeSpecies()
					                                    .calculateEstimatedCarbon(treesFarm.getAgeInYears(), envFactor);
					BigDecimal totalCarbon = carbonPerTree
							.multiply(BigDecimal.valueOf(treesFarm. getNumberTrees()));

					// Update
					treesFarmRepository. updateCarbonAbsorbed(treesFarmId, totalCarbon);
					updated++;

				} catch (Exception e) {
					log.error("Failed to update carbon for TreesFarm {}: {}", treesFarmId, e.getMessage());
				}
			}

			log.info("Daily carbon update completed.  Updated {} tree records", updated);

		} catch (Exception e) {
			log.error("Daily carbon absorption update failed: {}", e.getMessage(), e);
		}
	}

	/**
	 * Cập nhật thống kê Farm hàng ngày lúc 2:00 AM
	 */
	@Scheduled(cron = "0 0 2 * * ?")
	public void dailyUpdateFarmStats() {
		log.info("Starting daily farm stats update...");

		try {
			farmService.recalculateAllFarmStats();
			log.info("Daily farm stats update completed");
		} catch (Exception e) {
			log.error("Daily farm stats update failed: {}", e. getMessage(), e);
		}
	}

	/**
	 * Cập nhật computed fields của tất cả Projects hàng ngày lúc 3:00 AM
	 */
	@Scheduled(cron = "0 0 3 * * ?")
	public void dailyUpdateProjectStats() {
		log.info("Starting daily project stats update...");

		try {
			projectService.recalculateAllProjects();
			log.info("Daily project stats update completed");
		} catch (Exception e) {
			log.error("Daily project stats update failed: {}", e.getMessage(), e);
		}
	}

	/**
	 * Kiểm tra và cập nhật Carbon Reserve hết hạn mỗi giờ
	 */
	@Scheduled(cron = "0 0 * * * ?")
	@Transactional
	public void hourlyExpireReserves() {
		log.info("Checking for expired carbon reserves...");

		try {
			int expired = carbonReserveRepository.expireReserves(OffsetDateTime.now());
			if (expired > 0) {
				log.info("Expired {} carbon reserves", expired);
			}
		} catch (Exception e) {
			log.error("Failed to expire carbon reserves: {}", e.getMessage(), e);
		}
	}

	/**
	 * Báo cáo tổng hợp hàng tuần (Chủ nhật lúc 6:00 AM)
	 */
	@Scheduled(cron = "0 0 6 * * SUN")
	public void weeklyReport() {
		log.info("Generating weekly carbon report...");

		try {
			// TODO: Implement weekly report generation
			// - Tổng CO2 hấp thụ tuần này
			// - Số cây đã bán
			// - Doanh thu
			// - Các dự án hoạt động
			log.info("Weekly report generated");
		} catch (Exception e) {
			log.error("Weekly report generation failed: {}", e.getMessage(), e);
		}
	}
}
