package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.TransferStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity cho bảng contract_transfers - Chuyển nhượng hợp đồng
 */
@Entity
@Table(name = "contract_transfers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "contract_id", nullable = false)
    private Integer contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    private Contract contract;

    // Transfer details
    @Column(name = "from_user_id", nullable = false)
    private UUID fromUserId;

    @Column(name = "to_user_id", nullable = false)
    private UUID toUserId;

    @Column(name = "transfer_percentage", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal transferPercentage = new BigDecimal("100.00");

    @Column(name = "transfer_price", precision = 15, scale = 2)
    private BigDecimal transferPrice;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "transfer_status", length = 20)
    @Builder.Default
    private TransferStatus transferStatus = TransferStatus.PENDING;

    @Column(name = "transfer_date")
    private LocalDate transferDate;

    // Approval
    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}

