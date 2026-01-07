package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.PurchaseStatus;
import com.capston.project.back.end.common.ReserveStatus;
import com.capston.project.back.end.entity.CarbonReserve;
import com.capston.project.back.end.entity.CarbonReserveAllocation;
import com.capston.project.back.end.entity.Farm;
import com.capston.project.back.end.entity.PhaseTreePurchase;
import com.capston.project.back.end.entity.ProjectPhase;
import com.capston.project.back.end.entity.TreeSpecies;
import com.capston.project.back.end.entity.TreesFarm;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.CarbonReserveAllocationRepository;
import com.capston.project.back.end.repository.CarbonReserveRepository;
import com.capston.project.back.end.repository.FarmEnvironmentFactorRepository;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.repository.PhaseTreePurchaseRepository;
import com.capston.project.back.end.repository.ProjectPhaseRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.repository.TreesFarmRepository;
import com.capston.project.back.end.request.CarbonAllocationRequest;
import com.capston.project.back.end.request.TreePurchaseRequest;
import com.capston.project.back.end.response.CarbonSummaryResponse;
import com.capston.project.back.end.response.TreePurchaseResponse;
import com.capston.project.back.end.service.TreePurchaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TreePurchaseServiceImpl implements TreePurchaseService {
	private final PhaseTreePurchaseRepository purchaseRepository;
	private final ProjectPhaseRepository phaseRepository;
	private final ProjectRepository projectRepository;
	private final FarmRepository farmRepository;
	private final TreeSpeciesRepository treeSpeciesRepository;
	private final TreesFarmRepository treesFarmRepository;
	private final CarbonReserveRepository carbonReserveRepository;
	private final CarbonReserveAllocationRepository allocationRepository;
	private final FarmEnvironmentFactorRepository environmentFactorRepository;

	// ==================== PURCHASE OPERATIONS ====================

	@Override
	@Transactional
	public TreePurchaseResponse createPurchase(TreePurchaseRequest request, UUID managerId) {
		log.info("Creating tree purchase for phase: {}", request.getPhaseId());

		// Validate entities
		ProjectPhase phase = phaseRepository.findById(request.getPhaseId())
		                                    .orElseThrow(() -> new ResourceNotFoundException("ProjectPhase", "id", request. getPhaseId()));

		Farm farm = farmRepository.findById(request.getFarmId())
		                          .filter(f -> f.getDeletedAt() == null)
		                          .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", request.getFarmId()));

		TreeSpecies species = treeSpeciesRepository.findById(request.getTreeSpeciesId())
		                                           .filter(ts -> ts.getDeletedAt() == null)
		                                           .orElseThrow(() -> new ResourceNotFoundException("TreeSpecies", "id", request.getTreeSpeciesId()));

		// Find available trees in farm
		List<TreesFarm> availableTrees = treesFarmRepository.findAvailableByFarm(request.getFarmId()).stream()
		                                                    .filter(tf -> tf.getTreeSpecies().getId().equals(request.getTreeSpeciesId()))
		                                                    .collect(Collectors.toList());

		int totalAvailable = availableTrees.stream()
		                                   .mapToInt(TreesFarm::getAvailableTrees)
		                                   .sum();

		if (totalAvailable < request.getQuantity()) {
			throw new IllegalArgumentException(
					String.format("Not enough trees available.  Requested: %d, Available: %d",
					              request.getQuantity(), totalAvailable));
		}

		// Calculate carbon per tree with environmental factor
		BigDecimal envFactor = environmentFactorRepository.getAverageFactorByFarmId(farm.getId());
		TreesFarm firstBatch = availableTrees.get(0);
		BigDecimal carbonPerTree = firstBatch. getEstimatedCarbonPerTree().multiply(envFactor);

		// Create purchase
		PhaseTreePurchase purchase = PhaseTreePurchase.builder()
		                                              .phase(phase)
		                                              .farm(farm)
		                                              .treeSpecies(species)
		                                              .quantity(request.getQuantity())
		                                              .unitPrice(request.getUnitPrice())
		                                              .totalPrice(request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity())))
		                                              .estimatedCarbonPerTree(carbonPerTree)
		                                              .totalEstimatedCarbon(carbonPerTree.multiply(BigDecimal.valueOf(request.getQuantity())))
		                                              .actualCarbonAbsorbed(BigDecimal. ZERO)
		                                              .purchaseStatus(PurchaseStatus.PENDING)
		                                              .purchaseDate(request.getPurchaseDate() != null ? request.getPurchaseDate() : LocalDate.now())
		                                              .notes(request.getNotes())
		                                              .createdBy(managerId)
		                                              .build();

		PhaseTreePurchase saved = purchaseRepository.save(purchase);
		log.info("Created purchase {} for {} trees", saved.getId(), request.getQuantity());

		return mapToPurchaseResponse(saved);
	}

	@Override
	@Transactional
	public TreePurchaseResponse approvePurchase(Integer purchaseId, UUID approvedBy) {
		log.info("Approving purchase:  {}", purchaseId);

		PhaseTreePurchase purchase = purchaseRepository.findByIdWithDetails(purchaseId)
		                                               .orElseThrow(() -> new ResourceNotFoundException("PhaseTreePurchase", "id", purchaseId));

		if (purchase.getPurchaseStatus() != PurchaseStatus.PENDING) {
			throw new IllegalStateException("Can only approve PENDING purchases");
		}

		// Deduct trees from farm
		List<TreesFarm> availableTrees = treesFarmRepository.findAvailableByFarm(purchase.getFarm().getId()).stream()
		                                                    .filter(tf -> tf.getTreeSpecies().getId().equals(purchase.getTreeSpecies().getId()))
		                                                    .collect(Collectors.toList());

		int remaining = purchase.getQuantity();
		for (TreesFarm tf : availableTrees) {
			if (remaining <= 0) break;

			int toDeduct = Math.min(remaining, tf.getAvailableTrees());
			int updated = treesFarmRepository.decreaseAvailableTrees(tf. getId(), toDeduct);

			if (updated > 0) {
				remaining -= toDeduct;
				log.info("Deducted {} trees from TreesFarm {}", toDeduct, tf.getId());
			}
		}

		if (remaining > 0) {
			throw new IllegalStateException("Failed to deduct all trees from farm");
		}

		purchase.setPurchaseStatus(PurchaseStatus.APPROVED);
		purchase.setApprovedBy(approvedBy);

		PhaseTreePurchase saved = purchaseRepository.save(purchase);

		// Recalculate phase carbon
		recalculatePhaseCarbon(purchase.getPhase().getId());

		log.info("Approved purchase: {}", purchaseId);
		return mapToPurchaseResponse(saved);
	}

	@Override
	@Transactional
	public TreePurchaseResponse deliverPurchase(Integer purchaseId) {
		log.info("Delivering purchase: {}", purchaseId);

		PhaseTreePurchase purchase = purchaseRepository.findByIdWithDetails(purchaseId)
		                                               .orElseThrow(() -> new ResourceNotFoundException("PhaseTreePurchase", "id", purchaseId));

		if (purchase.getPurchaseStatus() != PurchaseStatus.APPROVED) {
			throw new IllegalStateException("Can only deliver APPROVED purchases");
		}

		purchase.setPurchaseStatus(PurchaseStatus.DELIVERED);
		purchase.setDeliveryDate(LocalDate.now());

		PhaseTreePurchase saved = purchaseRepository.save(purchase);

		// Recalculate phase and project
		recalculatePhaseCarbon(purchase.getPhase().getId());

		log.info("Delivered purchase: {}", purchaseId);
		return mapToPurchaseResponse(saved);
	}

	@Override
	@Transactional
	public TreePurchaseResponse cancelPurchase(Integer purchaseId, String reason) {
		log.info("Cancelling purchase: {}", purchaseId);

		PhaseTreePurchase purchase = purchaseRepository.findByIdWithDetails(purchaseId)
		                                               .orElseThrow(() -> new ResourceNotFoundException("PhaseTreePurchase", "id", purchaseId));

		if (purchase.getPurchaseStatus() == PurchaseStatus.DELIVERED) {
			throw new IllegalStateException("Cannot cancel DELIVERED purchases");
		}

		// If approved, restore trees to farm
		if (purchase.getPurchaseStatus() == PurchaseStatus.APPROVED) {
			List<TreesFarm> treesFarms = treesFarmRepository.findAvailableByFarm(purchase. getFarm().getId()).stream()
			                                                .filter(tf -> tf.getTreeSpecies().getId().equals(purchase.getTreeSpecies().getId()))
			                                                .collect(Collectors.toList());

			if (! treesFarms.isEmpty()) {
				TreesFarm tf = treesFarms.get(0);
				tf.setAvailableTrees(tf.getAvailableTrees() + purchase.getQuantity());
				treesFarmRepository. save(tf);
				log.info("Restored {} trees to TreesFarm {}", purchase.getQuantity(), tf.getId());
			}
		}

		purchase.setPurchaseStatus(PurchaseStatus. CANCELLED);
		purchase.setNotes((purchase.getNotes() != null ? purchase.getNotes() + "\n" : "") + "Cancelled:  " + reason);

		PhaseTreePurchase saved = purchaseRepository.save(purchase);

		// Recalculate
		recalculatePhaseCarbon(purchase.getPhase().getId());

		log.info("Cancelled purchase: {}", purchaseId);
		return mapToPurchaseResponse(saved);
	}

	@Override
	public TreePurchaseResponse getPurchaseById(Integer purchaseId) {
		PhaseTreePurchase purchase = purchaseRepository.findByIdWithDetails(purchaseId)
		                                               .orElseThrow(() -> new ResourceNotFoundException("PhaseTreePurchase", "id", purchaseId));
		return mapToPurchaseResponse(purchase);
	}

	// ==================== LIST PURCHASES ====================

	@Override
	public List<TreePurchaseResponse> getPurchasesByPhaseId(Integer phaseId) {
		return purchaseRepository.findByPhaseIdWithDetails(phaseId).stream()
		                         .map(this:: mapToPurchaseResponse)
		                         .collect(Collectors.toList());
	}

	@Override
	public List<TreePurchaseResponse> getPurchasesByProjectId(Integer projectId) {
		return purchaseRepository.findByProjectId(projectId).stream()
		                         .map(this::mapToPurchaseResponse)
		                         .collect(Collectors.toList());
	}

	@Override
	public Page<TreePurchaseResponse> getPurchasesByStatus(PurchaseStatus status, Pageable pageable) {
		return purchaseRepository.findByPurchaseStatus(status, pageable)
		                         .map(this::mapToPurchaseResponse);
	}

	// ==================== CARBON SUMMARY ====================

	@Override
	public CarbonSummaryResponse getCarbonSummaryByPhaseId(Integer phaseId) {
		ProjectPhase phase = phaseRepository.findById(phaseId)
		                                    .orElseThrow(() -> new ResourceNotFoundException("ProjectPhase", "id", phaseId));

		BigDecimal targetCarbon = phase.getTargetConsumedCarbon() != null ? phase.getTargetConsumedCarbon() : BigDecimal.ZERO;
		BigDecimal purchasedCarbon = purchaseRepository.sumPurchasedCarbonByPhaseId(phaseId);
		BigDecimal allocatedFromReserve = allocationRepository. sumAllocatedCarbonByPhaseId(phaseId);
		BigDecimal actualAbsorbed = purchaseRepository.sumActualCarbonByPhaseId(phaseId);
		BigDecimal totalCost = purchaseRepository.sumCostByPhaseId(phaseId);

		BigDecimal totalAcquired = purchasedCarbon. add(allocatedFromReserve);
		BigDecimal carbonDeficit = targetCarbon.subtract(totalAcquired);
		BigDecimal carbonSurplus = carbonDeficit.compareTo(BigDecimal.ZERO) < 0
		                           ? carbonDeficit. abs() : BigDecimal.ZERO;

		if (carbonDeficit.compareTo(BigDecimal.ZERO) < 0) {
			carbonDeficit = BigDecimal.ZERO;
		}

		BigDecimal completionPercentage = targetCarbon.compareTo(BigDecimal.ZERO) > 0
		                                  ? totalAcquired.divide(targetCarbon, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
		                                  : BigDecimal.ZERO;

		BigDecimal budgetRemaining = phase.getBudget() != null
		                             ? phase.getBudget().subtract(totalCost)
		                             : BigDecimal.ZERO;

		// Get available reserve
		Integer projectId = phase.getProject().getId();
		BigDecimal reserveAvailable = carbonReserveRepository.sumAvailableCarbonByProjectId(projectId);

		// Get purchases
		List<TreePurchaseResponse> purchases = getPurchasesByPhaseId(phaseId);

		return CarbonSummaryResponse.builder()
		                            .phaseId(phase.getId())
		                            .phaseName(phase.getPhaseName())
		                            .phaseOrder(phase.getPhaseOrder())
		                            .targetCarbon(targetCarbon)
		                            .purchasedCarbon(purchasedCarbon)
		                            .allocatedFromReserve(allocatedFromReserve)
		                            .totalAcquiredCarbon(totalAcquired)
		                            .actualAbsorbedCarbon(actualAbsorbed)
		                            .carbonDeficit(carbonDeficit)
		                            .carbonSurplus(carbonSurplus)
		                            .completionPercentage(completionPercentage. setScale(2, RoundingMode.HALF_UP))
		                            .totalCost(totalCost)
		                            .budgetRemaining(budgetRemaining)
		                            .purchases(purchases)
		                            .reserveAvailable(reserveAvailable)
		                            .build();
	}

	// ==================== CARBON RESERVE & ALLOCATION ====================

	@Override
	@Transactional
	public void transferSurplusToReserve(Integer phaseId, UUID userId) {
		log.info("Transferring surplus carbon from phase {} to reserve", phaseId);

		ProjectPhase phase = phaseRepository.findById(phaseId)
		                                    .orElseThrow(() -> new ResourceNotFoundException("ProjectPhase", "id", phaseId));

		CarbonSummaryResponse summary = getCarbonSummaryByPhaseId(phaseId);

		if (summary.getCarbonSurplus().compareTo(BigDecimal.ZERO) <= 0) {
			throw new IllegalStateException("No surplus carbon to transfer");
		}

		CarbonReserve reserve = CarbonReserve.builder()
		                                     .project(phase.getProject())
		                                     .sourcePhase(phase)
		                                     .carbonAmount(summary.getCarbonSurplus())
		                                     .remainingAmount(summary.getCarbonSurplus())
		                                     .status(ReserveStatus.AVAILABLE)
		                                     .sourceDescription("Surplus from phase:  " + phase.getPhaseName())
		                                     .build();

		carbonReserveRepository.save(reserve);

		log.info("Transferred {} kg CO2 from phase {} to reserve",
		         summary.getCarbonSurplus(), phaseId);
	}

	@Override
	@Transactional
	public void allocateCarbonFromReserve(CarbonAllocationRequest request, UUID userId) {
		log.info("Allocating carbon from phase {} to phase {}",
		         request.getSourcePhaseId(), request.getTargetPhaseId());

		ProjectPhase targetPhase = phaseRepository.findById(request.getTargetPhaseId())
		                                          .orElseThrow(() -> new ResourceNotFoundException("ProjectPhase", "id", request.getTargetPhaseId()));

		Integer projectId = targetPhase.getProject().getId();

		// Get available reserves
		List<CarbonReserve> reserves = carbonReserveRepository.findAvailableByProjectId(projectId);

		if (reserves.isEmpty()) {
			throw new IllegalStateException("No available carbon reserve for this project");
		}

		BigDecimal remaining = request.getCarbonAmount();

		for (CarbonReserve reserve : reserves) {
			if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

			BigDecimal allocated = reserve.allocate(remaining);

			CarbonReserveAllocation allocation = CarbonReserveAllocation.builder()
			                                                            .reserve(reserve)
			                                                            .targetPhase(targetPhase)
			                                                            .allocatedAmount(allocated)
			                                                            .allocationDate(LocalDate.now())
			                                                            .notes(request.getNotes())
			                                                            .allocatedBy(userId)
			                                                            .build();

			allocationRepository.save(allocation);
			carbonReserveRepository.save(reserve);

			remaining = remaining.subtract(allocated);

			log.info("Allocated {} kg CO2 from reserve {} to phase {}",
			         allocated, reserve.getId(), request.getTargetPhaseId());
		}

		if (remaining.compareTo(BigDecimal.ZERO) > 0) {
			log.warn("Could not allocate full amount.  Remaining: {} kg CO2", remaining);
		}

		// Recalculate
		recalculatePhaseCarbon(request.getTargetPhaseId());
	}

	// ==================== RECALCULATE ====================

	@Override
	@Transactional
	public void recalculatePhaseCarbon(Integer phaseId) {
		log.info("Recalculating carbon for phase:  {}", phaseId);

		ProjectPhase phase = phaseRepository.findById(phaseId)
		                                    .orElseThrow(() -> new ResourceNotFoundException("ProjectPhase", "id", phaseId));

		BigDecimal actualCost = purchaseRepository.sumCostByPhaseId(phaseId);
		BigDecimal currentCarbon = purchaseRepository.sumActualCarbonByPhaseId(phaseId)
		                                             .add(allocationRepository.sumAllocatedCarbonByPhaseId(phaseId));

		phaseRepository.updateComputedFields(phaseId, actualCost, currentCarbon);

		// Recalculate project
		recalculateProjectCarbon(phase.getProject().getId());

		log.info("Phase {} updated:  actualCost={}, currentCarbon={}", phaseId, actualCost, currentCarbon);
	}

	@Override
	@Transactional
	public void recalculateProjectCarbon(Integer projectId) {
		log.info("Recalculating carbon for project:  {}", projectId);

		BigDecimal budget = phaseRepository.sumBudgetByProjectId(projectId);
		BigDecimal targetCarbon = phaseRepository.sumTargetCarbonByProjectId(projectId);
		BigDecimal currentCarbon = phaseRepository.sumCurrentCarbonByProjectId(projectId);

		projectRepository.updateComputedFields(projectId, budget, targetCarbon, currentCarbon);

		log.info("Project {} updated: budget={}, target={}, current={}",
		         projectId, budget, targetCarbon, currentCarbon);
	}

	// ==================== HELPER METHODS ====================

	private TreePurchaseResponse mapToPurchaseResponse(PhaseTreePurchase purchase) {
		ProjectPhase phase = purchase.getPhase();
		Farm farm = purchase.getFarm();
		TreeSpecies species = purchase.getTreeSpecies();

		BigDecimal carbonDeficit = BigDecimal.ZERO;
		if (phase != null && phase.getTargetConsumedCarbon() != null) {
			BigDecimal totalPurchased = purchaseRepository.sumPurchasedCarbonByPhaseId(phase.getId());
			carbonDeficit = phase.getTargetConsumedCarbon().subtract(totalPurchased);
			if (carbonDeficit.compareTo(BigDecimal.ZERO) < 0) {
				carbonDeficit = BigDecimal.ZERO;
			}
		}

		return TreePurchaseResponse.builder()
		                           .id(purchase.getId())
		                           .phaseId(phase != null ? phase.getId() : null)
		                           .phaseName(phase != null ? phase.getPhaseName() : null)
		                           .phaseOrder(phase != null ? phase.getPhaseOrder() : null)
		                           .projectId(phase != null && phase.getProject() != null ? phase.getProject().getId() : null)
		                           .projectName(phase != null && phase. getProject() != null ? phase.getProject().getName() : null)
		                           .farmId(farm != null ?  farm.getId() : null)
		                           .farmName(farm != null ? farm. getName() : null)
		                           .treeSpeciesId(species != null ? species.getId() : null)
		                           .treeSpeciesName(species != null ? species. getName() : null)
		                           .quantity(purchase.getQuantity())
		                           .unitPrice(purchase.getUnitPrice())
		                           .totalPrice(purchase.getTotalPrice())
		                           .estimatedCarbonPerTree(purchase.getEstimatedCarbonPerTree())
		                           .totalEstimatedCarbon(purchase.getTotalEstimatedCarbon())
		                           .actualCarbonAbsorbed(purchase.getActualCarbonAbsorbed())
		                           .carbonDeficit(carbonDeficit)
		                           .purchaseStatus(purchase.getPurchaseStatus())
		                           .purchaseDate(purchase.getPurchaseDate())
		                           .deliveryDate(purchase.getDeliveryDate())
		                           .notes(purchase.getNotes())
		                           .createdBy(purchase.getCreatedBy())
		                           .approvedBy(purchase.getApprovedBy())
		                           .createdAt(purchase.getCreatedAt())
		                           .updatedAt(purchase.getUpdatedAt())
		                           .build();
	}
}