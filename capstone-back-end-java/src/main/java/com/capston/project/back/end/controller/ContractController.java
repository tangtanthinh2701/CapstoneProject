package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.ContractRequest;
import com.capston.project.back.end.response.ContractResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.response.generic.PageResponse;
import com.capston.project.back.end.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.UUID;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {
	private final ContractService contractService;
	private final UserRepository userRepository;

	@PostMapping
	public ResponseEntity<ApiResponse<ContractResponse>> createContract(@Valid @RequestBody ContractRequest request, Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID enterpriseId = user.getId();
		ContractResponse response = contractService.createContract(request, enterpriseId);
		return ResponseEntity.ok(ApiResponse.success("Tạo hợp đồng thành công. Vui lòng chờ phê duyệt.", response));
	}

	@PatchMapping("/{id}/approve")
	public ResponseEntity<ApiResponse<ContractResponse>> approveContract(@PathVariable Integer id, Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID approverId =  user.getId();
		ContractResponse response = contractService.approveContract(id, approverId);
		return ResponseEntity.ok(ApiResponse.success("Phê duyệt hợp đồng thành công", response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ContractResponse>> getContractById(@PathVariable Integer id) {
		ContractResponse response = contractService.getContractById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/my-contracts")
	public ResponseEntity<ApiResponse<PageResponse<ContractResponse>>> getMyContracts(@RequestParam(defaultValue = "0") int page,
	                                                                                  @RequestParam(defaultValue = "20") int size,
	                                                                                  Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID enterpriseId =  user.getId();
		PageResponse<ContractResponse> response = contractService.getContractsByEnterprise(enterpriseId, page, size);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<PageResponse<ContractResponse>>> getContractsByProject(@PathVariable Integer projectId,
	                                                                                         @RequestParam(defaultValue = "0") int page,
	                                                                                         @RequestParam(defaultValue = "20") int size) {
		PageResponse<ContractResponse> response = contractService.getContractsByProject(projectId, page, size);
		return ResponseEntity.ok(ApiResponse.success(response));
	}
}
