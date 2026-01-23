package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity cho bảng farm_environment_records - Ghi nhận yếu tố môi trường
 */
@Entity
@Table(name = "farm_environment_records", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "farm_id", "recorded_date" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmEnvironmentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "farm_id", nullable = false)
    private Integer farmId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", insertable = false, updatable = false)
    private Farm farm;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    // Raw measurements
    @Column(name = "rainfall_mm", precision = 6, scale = 3)
    @Builder.Default
    private BigDecimal rainfallMm = BigDecimal.ONE;

    @Column(name = "temperature_c", precision = 6, scale = 3)
    @Builder.Default
    private BigDecimal temperatureC = BigDecimal.ONE;

    @Column(name = "soil_ph", precision = 6, scale = 3)
    @Builder.Default
    private BigDecimal soilPh = BigDecimal.ONE;

    @Column(name = "soil_moisture_percent", precision = 5, scale = 2)
    private BigDecimal soilMoisturePercent;

    // Calculated factors
    @Column(name = "rainfall_factor", precision = 6, scale = 3)
    @Builder.Default
    private BigDecimal rainfallFactor = BigDecimal.ONE;

    @Column(name = "temperature_factor", precision = 6, scale = 3)
    @Builder.Default
    private BigDecimal temperatureFactor = BigDecimal.ONE;

    @Column(name = "soil_factor", precision = 6, scale = 3)
    @Builder.Default
    private BigDecimal soilFactor = BigDecimal.ONE;

    @Column(name = "overall_factor", precision = 6, scale = 3)
    @Builder.Default
    private BigDecimal overallFactor = BigDecimal.ONE;

    // Tracking
    @Column(name = "recorded_by")
    private UUID recordedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    @PreUpdate
    protected void calculateFactors() {
        // Individual Factors Logic (Threshold-based)
        if (rainfallMm != null) {
            // Optimal rainfall 50-150mm: factor 1.0, >150: 1.2, <50: 0.8
            if (rainfallMm.compareTo(new BigDecimal("150")) > 0)
                this.rainfallFactor = new BigDecimal("1.2");
            else if (rainfallMm.compareTo(new BigDecimal("50")) < 0)
                this.rainfallFactor = new BigDecimal("0.8");
            else
                this.rainfallFactor = BigDecimal.ONE;
        }

        if (temperatureC != null) {
            // Optimal temperature 20-30°C: 1.1, else 0.9
            double temp = temperatureC.doubleValue();
            if (temp >= 20 && temp <= 30)
                this.temperatureFactor = new BigDecimal("1.1");
            else
                this.temperatureFactor = new BigDecimal("0.9");
        }

        if (soilPh != null) {
            // Optimal pH 6.0-7.5: 1.1, else 0.9
            double ph = soilPh.doubleValue();
            if (ph >= 6.0 && ph <= 7.5)
                this.soilFactor = new BigDecimal("1.1");
            else
                this.soilFactor = new BigDecimal("0.9");
        }

        // Default to ONE if still null
        if (rainfallFactor == null)
            rainfallFactor = BigDecimal.ONE;
        if (temperatureFactor == null)
            temperatureFactor = BigDecimal.ONE;
        if (soilFactor == null)
            soilFactor = BigDecimal.ONE;

        this.overallFactor = rainfallFactor
                .multiply(temperatureFactor)
                .multiply(soilFactor)
                .setScale(3, java.math.RoundingMode.HALF_UP);
    }
}
