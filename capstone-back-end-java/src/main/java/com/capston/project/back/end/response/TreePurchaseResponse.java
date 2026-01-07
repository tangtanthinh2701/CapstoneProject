package com.capston.project.back.end.response;

import com.capston.project.back.end.common.PurchaseStatus;
import lombok.*;

import java. math.BigDecimal;
import java.time.LocalDate;
import java.time. OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreePurchaseResponse {
	private Integer id;

	// Phase info
	private Integer phaseId;
	private String phaseName;
	private Integer phaseOrder;
	private Integer projectId;
	private String projectName;

	// Farm info
	private Integer farmId;
	private String farmName;

	// Tree species info
	private Integer treeSpeciesId;
	private String treeSpeciesName;

	// Purchase details
	private Integer quantity;
	private BigDecimal unitPrice;
	private BigDecimal totalPrice;

	// Carbon
	private BigDecimal estimatedCarbonPerTree;
	private BigDecimal totalEstimatedCarbon;
	private BigDecimal actualCarbonAbsorbed;
	private BigDecimal carbonDeficit; // Số carbon còn thiếu so với target

	// Status
	private PurchaseStatus purchaseStatus;
	private LocalDate purchaseDate;
	private LocalDate deliveryDate;

	// Notes
	private String notes;

	// Tracking
	private UUID createdBy;
	private UUID approvedBy;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
}
