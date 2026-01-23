package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.BatchStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity cho bảng tree_batches - Lô cây trồng
 */
@Entity
@Table(name = "tree_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "batch_code", unique = true, nullable = false, length = 50)
    private String batchCode;

    @Column(name = "farm_id", nullable = false)
    private Integer farmId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", insertable = false, updatable = false)
    private Farm farm;

    @Column(name = "tree_species_id", nullable = false)
    private Integer treeSpeciesId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tree_species_id", insertable = false, updatable = false)
    private TreeSpecies treeSpecies;

    @Column(name = "phase_id")
    private Integer phaseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id", insertable = false, updatable = false)
    private ProjectPhase phase;

    // Planting info
    @Column(name = "quantity_planted", nullable = false)
    private Integer quantityPlanted;

    @Column(name = "planting_date", nullable = false)
    private LocalDate plantingDate;

    @Column(name = "planting_area_m2", precision = 12, scale = 2)
    private BigDecimal plantingAreaM2;

    // Supplier/Cost info
    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "unit_cost", precision = 15, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "total_cost", precision = 15, scale = 2)
    private BigDecimal totalCost;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "batch_status", length = 20)
    @Builder.Default
    private BatchStatus batchStatus = BatchStatus.ACTIVE; // ACTIVE, COMPLETED, REMOVED

    // Tracking
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by")
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void calculateTotalCost() {
        if (unitCost != null && quantityPlanted != null) {
            this.totalCost = unitCost.multiply(new BigDecimal(quantityPlanted))
                    .setScale(2, java.math.RoundingMode.HALF_UP);
        }
    }
}
