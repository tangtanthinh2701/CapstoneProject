package com.capston.project.back.end.common;

public enum CreditStatus {
	PENDING, // Chờ phê duyệt/xác minh
	AVAILABLE, // Có sẵn để bán
	PARTIALLY_SOLD, // Đã bán một phần
	SOLD_OUT, // Đã bán hết
	RETIRED, // Đã retire (sử dụng)
}
