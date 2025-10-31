package com.capston.project.back.end.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
	private String token;
	private String tokenType = "Bearer";
	private Integer userId;
	private String username;
	private String fullname;
}
