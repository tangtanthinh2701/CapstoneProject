package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.ContractTransfer;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.ContractTransferRequest;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.ContractTransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller quản lý chuyển nhượng hợp đồng (Contract Transfers)
 */
@RestController
@RequestMapping("/api/contract-transfers")
@RequiredArgsConstructor
@Slf4j
public class ContractTransferController {

    private final ContractTransferService transferService;
    private final UserRepository userRepository;

    // ==================== CREATE TRANSFER REQUEST ====================

    @PostMapping
    public ResponseEntity<ApiResponse<ContractTransfer>> createTransferRequest(
            @Valid @RequestBody ContractTransferRequest request,
            Authentication authentication) {
        UUID authenticatedUserId = getUserIdFromAuth(authentication);
        // Force the initiator to be the one from authentication
        request.setFromUserId(authenticatedUserId);

        ContractTransfer transfer = transferService.createTransferRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transfer request created successfully", transfer));
    }

    // ==================== GET TRANSFERS ====================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContractTransfer>> getTransferById(@PathVariable Integer id) {
        ContractTransfer transfer = transferService.getTransferById(id);
        return ResponseEntity.ok(ApiResponse.success(transfer));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ContractTransfer>>> getAllTransfers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ContractTransfer> transferPage = transferService.getAllTransfers(pageable);

        return ResponseEntity.ok(ApiResponse.success(
                "Transfers retrieved successfully",
                transferPage.getContent(),
                buildPageInfo(transferPage)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ContractTransfer>>> getPendingTransfers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ContractTransfer> transferPage = transferService.getPendingTransfers(pageable);

        return ResponseEntity.ok(ApiResponse.success(
                "Pending transfers retrieved",
                transferPage.getContent(),
                buildPageInfo(transferPage)));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<List<ContractTransfer>>> getTransfersByContract(
            @PathVariable Integer contractId) {
        List<ContractTransfer> transfers = transferService.getTransfersByContractId(contractId);
        return ResponseEntity.ok(ApiResponse.success(transfers));
    }

    @GetMapping("/my-transfers")
    public ResponseEntity<ApiResponse<List<ContractTransfer>>> getMyTransfers(
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        List<ContractTransfer> transfers = transferService.getTransfersByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(transfers));
    }

    // ==================== APPROVE/REJECT ====================

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContractTransfer>> approveTransfer(
            @PathVariable Integer id,
            Authentication authentication) {
        UUID approvedBy = getUserIdFromAuth(authentication);
        ContractTransfer transfer = transferService.approveTransfer(id, approvedBy);
        return ResponseEntity.ok(ApiResponse.success("Transfer approved successfully", transfer));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContractTransfer>> rejectTransfer(
            @PathVariable Integer id,
            @RequestParam String reason) {
        ContractTransfer transfer = transferService.rejectTransfer(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Transfer rejected", transfer));
    }

    // ==================== CANCEL ====================

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ContractTransfer>> cancelTransfer(
            @PathVariable Integer id,
            Authentication authentication) {
        // Optional: verify the user cancelling is the one who initiated it
        ContractTransfer transfer = transferService.cancelTransfer(id);
        return ResponseEntity.ok(ApiResponse.success("Transfer cancelled", transfer));
    }

    // ==================== HELPER ====================

    private UUID getUserIdFromAuth(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private ApiResponse.PageInfo buildPageInfo(Page<?> page) {
        return ApiResponse.PageInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
