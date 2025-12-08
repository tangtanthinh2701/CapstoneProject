package com.capston.project.back.end.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditTransactionRequest {
	@NotNull(message = "ID tín chỉ không được để trống")
	private Integer creditId;

	@NotNull(message = "Số lượng không được để trống")
	@Min(value = 1, message = "Số lượng phải >= 1")
	private Integer quantity;

	private String retirementReason;
}
