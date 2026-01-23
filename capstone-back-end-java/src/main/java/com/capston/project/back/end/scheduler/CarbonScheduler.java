package com.capston.project.back.end.scheduler;

import com.capston.project.back.end.entity.TreeBatch;
import com.capston.project.back.end.entity.TreeGrowthRecord;
import com.capston.project.back.end.repository.FarmEnvironmentRecordRepository;
import com.capston.project.back.end.repository.TreeBatchRepository;
import com.capston.project.back.end.repository.TreeGrowthRecordRepository;
import com.capston.project.back.end.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CarbonScheduler {
	private final TreeBatchRepository treeBatchRepository;
	private final TreeGrowthRecordRepository growthRecordRepository;
	private final FarmEnvironmentRecordRepository environmentRecordRepository;
	private final ProjectService projectService;

	/**
	 * Cập nhật CO2 hấp thụ cho tất cả lô cây hàng ngày lúc 1:00 AM
	 */
	@Scheduled(cron = "0 0 1 * * ?")
	@Transactional
	public void dailyUpdateCarbonAbsorption() {
		log.info("Starting daily carbon absorption update...");

		try {
			List<TreeBatch> activeBatches = treeBatchRepository.findAll().stream()
			                                                   .filter(b -> "ACTIVE".equals(b.getBatchStatus()))
			                                                   .toList();
			int updated = 0;

			for (TreeBatch batch : activeBatches) {
				try {
					// Get latest growth record
					var latestRecord = growthRecordRepository.findLatestByBatchId(batch.getId());
					if (latestRecord.isEmpty()) continue;

					TreeGrowthRecord record = latestRecord.get();

					// Get environmental factor
					BigDecimal envFactor = environmentRecordRepository.getLatestFactorByFarmId(batch.getFarmId());
					if (envFactor == null) envFactor = BigDecimal.ONE;

					// Calculate age in years
					long daysOld = ChronoUnit.DAYS.between(batch.getPlantingDate(), LocalDate.now());
					int ageInYears = (int) (daysOld / 365);
					if (ageInYears < 1) ageInYears = 1;

					// Calculate CO2 absorbed (simple formula)
					// CO2 = k_i * age * envFactor * quantityAlive
					BigDecimal baseCarbonRate = batch.getTreeSpecies() != null
					    ? batch.getTreeSpecies().getBaseCarbonRate()
					    : new BigDecimal("10.0"); // default

					BigDecimal co2PerTree = baseCarbonRate
							.multiply(BigDecimal.valueOf(ageInYears))
							.multiply(envFactor);
					BigDecimal totalCo2 = co2PerTree.multiply(BigDecimal.valueOf(record.getQuantityAlive()));

					// Update the record
					record.setCo2AbsorbedKg(totalCo2);
					record.setEnvironmentFactor(envFactor);
					growthRecordRepository.save(record);

					updated++;

				} catch (Exception e) {
					log.error("Failed to update carbon for batch {}: {}", batch.getId(), e.getMessage());
				}
			}

			log.info("Daily carbon update completed. Updated {} batch records", updated);

		} catch (Exception e) {
			log.error("Daily carbon absorption update failed: {}", e.getMessage(), e);
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
}
