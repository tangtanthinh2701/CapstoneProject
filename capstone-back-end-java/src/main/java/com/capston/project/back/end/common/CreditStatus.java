package com.capston.project.back.end.common;

public enum CreditStatus {
	PENDING,        // Chờ xác minh
	AVAILABLE,      // Có sẵn để bán
	PARTIALLY_SOLD, // Đã bán một phần
	SOLD_OUT,       // Đã bán hết
	RETIRED,        // Đã retire (sử dụng)
	EXPIRED,        // Hết hạn
	CANCELLED       // Đã hủy
}
