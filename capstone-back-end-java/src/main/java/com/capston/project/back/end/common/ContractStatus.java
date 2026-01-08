package com.capston.project.back.end.common;

public enum ContractStatus {
	DRAFT,           // Nháp
	PENDING,         // Chờ duyệt
	ACTIVE,          // Đang hiệu lực
	EXPIRING_SOON,   // Sắp hết hạn (30 ngày)
	EXPIRED,         // Đã hết hạn
	RENEWED,         // Đã gia hạn
	COMPLETED,       // Hoàn thành
	TERMINATED,      // Chấm dứt sớm
	CANCELLED        // Hủy bỏ
}
