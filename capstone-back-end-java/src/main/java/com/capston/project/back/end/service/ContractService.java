package com.capston.project.back.end.service;

import com.capston.project.back.end.request.ContractRequest;
import com.capston.project.back.end.response.ContractResponse;
import com.capston.project.back.end.response.generic.PageResponse;

import java.util.UUID;

public interface ContractService {
	ContractResponse createContract(ContractRequest request, UUID enterpriseId);
	ContractResponse updateContract(Integer id, ContractRequest request);
	ContractResponse approveContract(Integer contractId, UUID approverId);
	PageResponse<ContractResponse> getContractsByEnterprise(UUID enterpriseId, int page, int size);
	PageResponse<ContractResponse> getContractsByProject(Integer projectId, int page, int size);
	ContractResponse getContractById(Integer id);
}
