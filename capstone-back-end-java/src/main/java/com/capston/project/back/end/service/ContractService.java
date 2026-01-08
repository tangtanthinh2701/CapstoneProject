package com.capston.project.back.end.service;

import com.capston.project.back.end.common.ContractStatus;
import com.capston.project.back.end.request.ContractApprovalRequest;
import com.capston.project.back.end.request.ContractRenewalRequest;
import com.capston.project.back.end.request.ContractRequest;
import com.capston.project.back.end.request.ContractTerminationRequest;
import com.capston.project.back.end.response.ContractRenewalResponse;
import com.capston.project.back.end.response.ContractResponse;
import com.capston.project.back.end.response.ContractSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ContractService {
	// Contract CRUD
	ContractResponse createContract(ContractRequest request);
	ContractResponse getContractById(Integer id);
	ContractResponse getContractByCode(String code);
	ContractResponse updateContract(Integer id, ContractRequest request);
	void deleteContract(Integer id);

	// Contract List
	Page<ContractResponse> getAllContracts(Pageable pageable);
	Page<ContractResponse> getContractsByStatus(ContractStatus status, Pageable pageable);
	List<ContractResponse> getContractsByProjectId(Integer projectId);
	Page<ContractResponse> searchContracts(String keyword, Pageable pageable);

	// Contract Workflow
	ContractResponse submitForApproval(Integer id);
	ContractResponse approveContract(Integer id, ContractApprovalRequest request);
	ContractResponse rejectContract(Integer id, String reason);
	ContractResponse activateContract(Integer id);
	ContractResponse terminateContract(Integer id, ContractTerminationRequest request);

	// Contract Renewal
	ContractRenewalResponse requestRenewal(ContractRenewalRequest request);
	ContractRenewalResponse approveRenewal(Integer renewalId, ContractApprovalRequest request);
	ContractRenewalResponse rejectRenewal(Integer renewalId, String reason);
	List<ContractRenewalResponse> getRenewalsByContractId(Integer contractId);

	// Statistics
	ContractSummaryResponse getContractSummary();
	List<ContractResponse> getExpiringSoonContracts();
	List<ContractResponse> getExpiredContracts();

	// Scheduled tasks
	void checkAndUpdateExpiringSoonContracts();
	void checkAndUpdateExpiredContracts();
	void processAutoRenewals();
}
