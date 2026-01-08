package com.capston.project.back.end.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRequest {
	@NotBlank(message = "Partner name is required")
	private String partnerName;

	@Size(max = 500, message = "Image URL must not exceed 500 characters")
	private String imgUrl;
}