package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.entity.Contracts;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.ContractsRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.ContractRequest;
import com.capston.project.back.end.response.ContractResponse;
import com.capston.project.back.end.response.generic.PageResponse;
import com.capston.project.back.end.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {
	private final ContractsRepository contractsRepository;
	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;
	@Override
	public ContractResponse createContract(ContractRequest request, UUID enterpriseId) {
		Project project = projectRepository.findById(request.getProjectId())
		                                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

		if (!project.getIsPublic()) {
			throw new IllegalArgumentException("Project is not public for purchase");
		}

		User enterprise = userRepository.findById(enterpriseId)
		                                .orElseThrow(() -> new ResourceNotFoundException(
				                                  "Enterprise not found with id: " + enterpriseId));

		// Tính total amount
		BigDecimal totalAmount = request.getUnitPrice()
		                                .multiply(request.getNumTrees() != null
		                                          ? BigDecimal.valueOf(request.getNumTrees())
		                                          : request.getArea());

		String contractCode = generateContractCode();

		Contracts contract = Contracts.builder()
		                              .contractCode(contractCode)
		                              .project(project)
		                              .enterprise(enterprise)
		                              .contractType(request.getContractType())
		                              .numTrees(request.getNumTrees())
		                              .area(request.getArea())
		                              .unitPrice(request.getUnitPrice())
		                              .totalAmount(totalAmount)
		                              .contractTermYears(request.getContractTermYears())
		                              .startDate(request.getStartDate())
		                              .endDate(request.getEndDate())
		                              .autoRenewal(request.getAutoRenewal())
		                              .renewalTermYears(request.getRenewalTermYears())
		                              .carbonCreditSharing(request.getCarbonCreditSharing())
		                              .harvestRights(request.getHarvestRights())
		                              .transferAllowed(request.getTransferAllowed())
		                              .earlyTerminationPenalty(request.getEarlyTerminationPenalty())
		                              .paymentDate(request.getPaymentDate())
		                              .contractStatus("PENDING")
		                              .notes(request.getNotes())
		                              .build();

		Contracts saved = contractsRepository.save(contract);
		return convertToResponse(saved);
	}

	@Override
	public ContractResponse updateContract(Integer id, ContractRequest request) {
		return null;
	}

	@Override
	public ContractResponse approveContract(Integer contractId, UUID approverId) {
		Contracts contract = contractsRepository.findById(contractId)
		                                        .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + contractId));

		User approver = userRepository.findById(approverId)
		                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + approverId));

		contract.setContractStatus("ACTIVE");
		contract.setApprovedBy(approver);
		contract.setApprovedAt(LocalDateTime.now());

		Contracts saved = contractsRepository.save(contract);
		return convertToResponse(saved);
	}

	@Override
	public PageResponse<ContractResponse> getContractsByEnterprise(UUID enterpriseId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<Contracts> contractPage = contractsRepository.findByEnterpriseId(enterpriseId, pageable);

		return buildPageResponse(contractPage);
	}

	@Override
	public PageResponse<ContractResponse> getContractsByProject(Integer projectId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<Contracts> contractPage = contractsRepository.findByProjectId(projectId, pageable);

		return buildPageResponse(contractPage);
	}

	@Override
	public ContractResponse getContractById(Integer id) {
		Contracts contract = contractsRepository.findById(id)
		                                        .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));

		return convertToResponse(contract);
	}

	private String generateContractCode() {
		String prefix = "CTR";
		String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
		String code = prefix + timestamp;

		while (contractsRepository.existsByContractCode(code)) {
			timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
			code = prefix + timestamp;
		}

		return code;
	}

	private PageResponse<ContractResponse> buildPageResponse(Page<Contracts> page) {
		return PageResponse.<ContractResponse>builder()
		                   .content(page.getContent().stream()
		                                .map(this::convertToResponse)
		                                .collect(java.util.stream.Collectors.toList()))
		                   .pageNumber(page.getNumber())
		                   .pageSize(page.getSize())
		                   .totalElements(page.getTotalElements())
		                   .totalPages(page.getTotalPages())
		                   .last(page.isLast())
		                   .build();
	}

	private ContractResponse convertToResponse(Contracts contract) {
		ContractResponse response = modelMapper.map(contract, ContractResponse.class);
		response.setProjectId(contract.getProject().getId());
		response.setProjectName(contract.getProject().getName());
		response.setEnterpriseName(contract.getEnterprise().getFullname());
		return response;
	}
}
