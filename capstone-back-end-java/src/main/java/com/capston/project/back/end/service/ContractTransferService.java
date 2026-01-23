package com.capston.project.back.end.service;

import com.capston.project.back.end.entity.ContractTransfer;
import com.capston.project.back.end.request.ContractTransferRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service interface cho quản lý chuyển nhượng hợp đồng
 */
public interface ContractTransferService {

    // ==================== CREATE ====================

    ContractTransfer createTransferRequest(ContractTransferRequest request);

    // ==================== READ ====================

    ContractTransfer getTransferById(Integer id);

    Page<ContractTransfer> getAllTransfers(Pageable pageable);

    Page<ContractTransfer> getPendingTransfers(Pageable pageable);

    List<ContractTransfer> getTransfersByContractId(Integer contractId);

    List<ContractTransfer> getTransfersByUserId(UUID userId);

    // ==================== APPROVE/REJECT ====================

    /**
     * Phê duyệt chuyển nhượng
     * - Cập nhật transfer_status = APPROVED
     * - Chuyển credit_allocations từ chủ cũ sang chủ mới
     */
    ContractTransfer approveTransfer(Integer transferId, UUID approvedBy);

    /**
     * Từ chối chuyển nhượng
     */
    ContractTransfer rejectTransfer(Integer transferId, String reason);

    /**
     * Hủy yêu cầu chuyển nhượng (bởi người yêu cầu)
     */
    ContractTransfer cancelTransfer(Integer transferId);
}

