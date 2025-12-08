package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.CarbonCreditRequest;
import com.capston.project.back.end.request.CreditTransactionRequest;
import com.capston.project.back.end.response.CarbonCreditResponse;
import com.capston.project.back.end.response.CreditTransactionResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.response.generic.PageResponse;
import com.capston.project.back.end.service.CarbonCreditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/carbon-credits")
@RequiredArgsConstructor
public class CarbonCreditController {
	private final CarbonCreditService carbonCreditService;
	private final UserRepository userRepository;

	@PostMapping("/issue")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> issueCarbonCredit(@Valid @RequestBody CarbonCreditRequest request, Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID issuerId =  user.getId();
		CarbonCreditResponse response = carbonCreditService.issueCarbonCredit(request, issuerId);
		return ResponseEntity.ok(ApiResponse.success("Phát hành tín chỉ carbon thành công", response));
	}

	@PostMapping("/purchase")
	public ResponseEntity<ApiResponse<CreditTransactionResponse>> purchaseCredits(@Valid @RequestBody CreditTransactionRequest request, Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID enterpriseId = user.getId();
		CreditTransactionResponse response = carbonCreditService.purchaseCredits(request, enterpriseId);
		return ResponseEntity.ok(ApiResponse.success("Mua tín chỉ thành công", response));
	}

	@PatchMapping("/transactions/{id}/retire")
	public ResponseEntity<ApiResponse<CreditTransactionResponse>> retireCredits(@PathVariable Integer id,
	                                                                            @RequestParam String reason,
	                                                                            Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID enterpriseId = user.getId();
		CreditTransactionResponse response = carbonCreditService.retireCredits(id, reason, enterpriseId);
		return ResponseEntity.ok(ApiResponse.success("Retire tín chỉ thành công", response));
	}

	@GetMapping("/available")
	public ResponseEntity<ApiResponse<PageResponse<CarbonCreditResponse>>> getAvailableCredits(@RequestParam(defaultValue = "0") int page,
	                                                                                           @RequestParam(defaultValue = "20") int size) {
		PageResponse<CarbonCreditResponse> response = carbonCreditService.getAvailableCredits(page, size);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<PageResponse<CarbonCreditResponse>>> getCreditsByProject(@PathVariable Integer projectId,
	                                                                                           @RequestParam(defaultValue = "0") int page,
	                                                                                           @RequestParam(defaultValue = "20") int size) {
		PageResponse<CarbonCreditResponse> response = carbonCreditService.getCreditsByProject(projectId, page, size);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/my-transactions")
	public ResponseEntity<ApiResponse<PageResponse<CreditTransactionResponse>>> getMyTransactions(@RequestParam(defaultValue = "0") int page,
	                                                                                              @RequestParam(defaultValue = "20") int size,
	                                                                                              Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID enterpriseId =  user.getId();
		PageResponse<CreditTransactionResponse> response = carbonCreditService.getTransactionsByEnterprise(enterpriseId, page, size);
		return ResponseEntity.ok(ApiResponse.success(response));
	}
}
