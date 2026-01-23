package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.HealthStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity cho bảng tree_growth_records - Ghi nhận sinh trưởng cây
 */
@Entity
@Table(name = "tree_growth_records", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "batch_id", "recorded_date" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeGrowthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "batch_id", nullable = false)
    private Integer batchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", insertable = false, updatable = false)
    private TreeBatch batch;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    // Tree count
    @Column(name = "quantity_alive", nullable = false)
    private Integer quantityAlive;

    @Column(name = "quantity_dead")
    @Builder.Default
    private Integer quantityDead = 0;

    // Measurements
    @Column(name = "avg_height_cm", precision = 10, scale = 2)
    private BigDecimal avgHeightCm;

    @Column(name = "avg_trunk_diameter_cm", precision = 10, scale = 2)
    private BigDecimal avgTrunkDiameterCm;

    @Column(name = "avg_canopy_diameter_cm", precision = 10, scale = 2)
    private BigDecimal avgCanopyDiameterCm;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_status", length = 20)
    @Builder.Default
    private HealthStatus healthStatus = HealthStatus.HEALTHY; // HEALTHY, DISEASED, STRESSED

    // CO2 calculation
    @Column(name = "co2_absorbed_kg", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal co2AbsorbedKg = BigDecimal.ZERO;

    @Column(name = "environment_factor", precision = 6, scale = 3)
    @Builder.Default
    private BigDecimal environmentFactor = BigDecimal.ONE;

    // Notes
    @Column(name = "health_notes", columnDefinition = "TEXT")
    private String healthNotes;

    // Tracking
    @Column(name = "recorded_by")
    private UUID recordedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
