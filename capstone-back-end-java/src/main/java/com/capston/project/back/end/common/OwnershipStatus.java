package com.capston.project.back.end.common;

public enum OwnershipStatus {
	PENDING,    // Chờ kích hoạt
	ACTIVE,     // Đang hiệu lực
	EXPIRED,    // Hết hạn
	TRANSFERRED,// Đã chuyển nhượng
	TERMINATED  // Chấm dứt
}
