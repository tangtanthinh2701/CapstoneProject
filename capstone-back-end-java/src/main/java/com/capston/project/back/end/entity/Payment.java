package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "payment_code", unique = true, nullable = false, length = 50)
	private String paymentCode;

	@Column(name = "contract_id")
	private Integer contractId;

	@Column(name = "credit_transaction_id")
	private Integer creditTransactionId;

	@Column(name = "payer_id", nullable = false)
	private UUID payerId;

	@Column(name = "payee_id")
	private UUID payeeId;

	@Column(name = "amount", precision = 15, scale = 2, nullable = false)
	private BigDecimal amount;

	@Column(name = "currency", length = 3)
	@Builder.Default
	private String currency = "VND";

	@Column(name = "payment_method", length = 50)
	private String paymentMethod;

	@Column(name = "payment_gateway", length = 50)
	private String paymentGateway;

	@Column(name = "transaction_ref", length = 255)
	private String transactionRef;

	// VNPay specific fields
	@Column(name = "vnp_txn_ref", length = 100)
	private String vnpTxnRef;

	@Column(name = "vnp_transaction_no", length = 100)
	private String vnpTransactionNo;

	@Column(name = "vnp_response_code", length = 10)
	private String vnpResponseCode;

	@Column(name = "vnp_bank_code", length = 50)
	private String vnpBankCode;

	// Bank details
	@Column(name = "bank_name", length = 100)
	private String bankName;

	@Column(name = "account_number", length = 50)
	private String accountNumber;

	@Column(name = "account_holder", length = 255)
	private String accountHolder;

	@Enumerated(EnumType.STRING)
	@Column(name = "payment_status", length = 20)
	@Builder.Default
	private PaymentStatus paymentStatus = PaymentStatus.PENDING;

	@Column(name = "payment_date")
	private OffsetDateTime paymentDate;

	@Column(name = "completed_at")
	private OffsetDateTime completedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Helper methods
	public void markAsCompleted(String gatewayTransactionId) {
		this.paymentStatus = PaymentStatus.COMPLETED;
		this.transactionRef = gatewayTransactionId;
		this.completedAt = OffsetDateTime.now();
	}

	public void markAsFailed(String reason) {
		this.paymentStatus = PaymentStatus.FAILED;
		this.notes = (this.notes != null ? this.notes + "\n" : "") + "Failed: " + reason;
	}

	public void refund(String reason) {
		this.paymentStatus = PaymentStatus.REFUNDED;
		this.notes = (this.notes != null ? this.notes + "\n" : "") + "Refunded: " + reason;
	}

	public boolean isPending() {
		return PaymentStatus.PENDING == paymentStatus;
	}

	public boolean isCompleted() {
		return PaymentStatus.COMPLETED == paymentStatus;
	}

	public boolean isFailed() {
		return PaymentStatus.FAILED == paymentStatus;
	}

	public boolean isRefunded() {
		return PaymentStatus.REFUNDED == paymentStatus;
	}

	@PrePersist
	protected void validateReference() {
		// Payment có thể không cần reference (thanh toán độc lập)
		// Nếu cần validate, sử dụng contractId và creditTransactionId
		if (contractId != null && creditTransactionId != null) {
			throw new IllegalStateException("Payment cannot reference both contract and credit transaction");
		}
	}
}

