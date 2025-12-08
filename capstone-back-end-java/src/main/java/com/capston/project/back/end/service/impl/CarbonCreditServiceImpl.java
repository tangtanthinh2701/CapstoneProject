package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.entity.AnnualGrowthData;
import com.capston.project.back.end.entity.CarbonCredits;
import com.capston.project.back.end.entity.CreditTransactions;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.AnnualGrowthDataRepository;
import com.capston.project.back.end.repository.CarbonCreditsRepository;
import com.capston.project.back.end.repository.CreditTransactionsRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.CarbonCreditRequest;
import com.capston.project.back.end.request.CreditTransactionRequest;
import com.capston.project.back.end.response.CarbonCreditResponse;
import com.capston.project.back.end.response.CreditTransactionResponse;
import com.capston.project.back.end.response.generic.PageResponse;
import com.capston.project.back.end.service.CarbonCreditService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarbonCreditServiceImpl implements CarbonCreditService {
	private final CarbonCreditsRepository carbonCreditsRepository;
	private final CreditTransactionsRepository transactionsRepository;
	private final ProjectRepository projectRepository;
	private final AnnualGrowthDataRepository growthDataRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	@Override
	public CarbonCreditResponse issueCarbonCredit(CarbonCreditRequest request, UUID issuerId) {
		Project project = projectRepository.findById(request.getProjectId())
		                                   .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

		// Kiểm tra project status - chỉ GROWING hoặc MATURE mới phát hành tín chỉ
		if (!project.getProjectStatus().equals(ProjectStatus.GROWING) || !project.getProjectStatus().equals(ProjectStatus.MATURE)) {
			throw new IllegalStateException("Project must be in GROWING or MATURE status to issue credits");
		}

		// Kiểm tra xem đã phát hành tín chỉ cho năm này chưa
		if (carbonCreditsRepository.findByProjectIdAndReportYear(request.getProjectId(), request.getReportYear()).isPresent()) {
			throw new IllegalStateException("Carbon credits already issued for this year");
		}

		User issuer = userRepository.findById(issuerId)
		                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + issuerId));

		// Lấy dữ liệu sinh trưởng của năm này
		List<AnnualGrowthData> growthDataList = growthDataRepository.findByProjectAndYearWithTreeSpecies(request.getProjectId(), request.getReportYear());

		if (growthDataList.isEmpty()) {
			throw new IllegalStateException("No growth data found for year " + request.getReportYear());
		}

		// Tính tổng CO2 (kg -> tấn)
		BigDecimal totalCO2Kg = growthDataList.stream()
		                                      .map(AnnualGrowthData::getCo2Absorbed)
		                                      .filter(co2 -> co2 != null)
		                                      .reduce(BigDecimal.ZERO, BigDecimal::add);

		BigDecimal totalCO2Tons = totalCO2Kg
				.divide(BigDecimal.valueOf(1000), 2, RoundingMode.HALF_UP);

		// 1 tín chỉ = 1 tấn CO2
		Integer creditsIssued = totalCO2Tons.intValue();

		if (creditsIssued <= 0) {
			throw new IllegalStateException("Insufficient CO2 absorbed to issue credits");
		}

		String creditCode = generateCreditCode();

		CarbonCredits credit = CarbonCredits.builder()
		                                    .creditCode(creditCode)
		                                    .project(project)
		                                    .reportYear(request.getReportYear())
		                                    .totalCo2Tons(totalCO2Tons)
		                                    .creditsIssued(creditsIssued)
		                                    .creditsSold(0)
		                                    .creditsRetired(0)
		                                    .creditsAvailable(creditsIssued)
		                                    .pricePerCredit(request.getPricePerCredit())
		                                    .creditsStatus("AVAILABLE")
		                                    .verificationStandard(request.getVerificationStandard())
		                                    .issuedBy(issuer)
		                                    .issuedAt(OffsetDateTime.now())
		                                    .build();

		CarbonCredits saved = carbonCreditsRepository.save(credit);

		return convertToResponse(saved);
	}

	@Override
	public CreditTransactionResponse purchaseCredits(CreditTransactionRequest request, UUID enterpriseId) {
		CarbonCredits credit = carbonCreditsRepository.findById(request.getCreditId())
		                                              .orElseThrow(() -> new ResourceNotFoundException("Carbon credit not found with id: " + request.getCreditId()));

		if (credit.getCreditsAvailable() < request.getQuantity()) {
			throw new IllegalStateException("Not enough credits available. Available: " + credit.getCreditsAvailable());
		}

		User enterprise = userRepository.findById(enterpriseId)
		                                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found with id: " + enterpriseId));

		// Cập nhật số lượng tín chỉ
		credit.setCreditsSold(credit.getCreditsSold() + request.getQuantity());
		credit.setCreditsAvailable(credit.getCreditsAvailable() - request.getQuantity());

		if (credit.getCreditsAvailable() == 0) {
			credit.setCreditsStatus("SOLD_OUT");
		}

		carbonCreditsRepository.save(credit);

		// Tạo giao dịch
		String transactionCode = generateTransactionCode();
		BigDecimal totalAmount = credit.getPricePerCredit().multiply(BigDecimal.valueOf(request.getQuantity()));

		CreditTransactions transaction = CreditTransactions.builder()
		                                                   .transactionCode(transactionCode)
		                                                   .credit(credit)
		                                                   .enterprise(enterprise)
		                                                   .quantity(request.getQuantity())
		                                                   .unitPrice(credit.getPricePerCredit())
		                                                   .totalAmount(totalAmount)
		                                                   .transactionStatus("PURCHASED")
		                                                   .purchasedAt(OffsetDateTime.now())
		                                                   .build();

		CreditTransactions saved = transactionsRepository.save(transaction);

		return convertTransactionToResponse(saved);
	}

	@Override
	public CreditTransactionResponse retireCredits(Integer transactionId, String retirementReason, UUID enterpriseId) {
		CreditTransactions transaction = transactionsRepository.findById(transactionId)
		                                                       .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + transactionId));

		if (!transaction.getEnterprise().getId().equals(enterpriseId)) {
			throw new IllegalStateException("You can only retire your own credits");
		}

		if (transaction.getTransactionStatus().equals("RETIRED")) {
			throw new IllegalStateException("Credits already retired");
		}

		// Cập nhật trạng thái
		transaction.setTransactionStatus("RETIRED");
		transaction.setRetirementReason(retirementReason);
		transaction.setRetiredAt(OffsetDateTime.now());

		// Cập nhật carbon credits
		CarbonCredits credit = transaction.getCredit();
		credit.setCreditsRetired(credit.getCreditsRetired() + transaction.getQuantity());

		carbonCreditsRepository.save(credit);
		CreditTransactions saved = transactionsRepository.save(transaction);

		return convertTransactionToResponse(saved);
	}

	@Override
	public PageResponse<CarbonCreditResponse> getAvailableCredits(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("issuedAt").descending());
		Page<CarbonCredits> creditPage = carbonCreditsRepository.findAvailableCredits(pageable);

		return buildCreditPageResponse(creditPage);
	}

	@Override
	public PageResponse<CarbonCreditResponse> getCreditsByProject(Integer projectId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("reportYear").descending());
		Page<CarbonCredits> creditPage = carbonCreditsRepository.findByProjectId(projectId, pageable);

		return buildCreditPageResponse(creditPage);
	}

	@Override
	public PageResponse<CreditTransactionResponse> getTransactionsByEnterprise(UUID enterpriseId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("purchasedAt").descending());
		Page<CreditTransactions> transactionPage = transactionsRepository.findByEnterpriseId(enterpriseId, pageable);

		return buildTransactionPageResponse(transactionPage);
	}

	private String generateCreditCode() {
		String prefix = "CRD";
		String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
		String code = prefix + timestamp;

		while (carbonCreditsRepository.existsByCreditCode(code)) {
			timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
			code = prefix + timestamp;
		}

		return code;
	}

	private String generateTransactionCode() {
		String prefix = "TXN";
		String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
		String code = prefix + timestamp;

		while (transactionsRepository.existsByTransactionCode(code)) {
			timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
			code = prefix + timestamp;
		}

		return code;
	}

	private PageResponse<CarbonCreditResponse> buildCreditPageResponse(Page<CarbonCredits> page) {
		return PageResponse.<CarbonCreditResponse>builder()
		                   .content(page.getContent().stream()
		                                .map(this::convertToResponse)
		                                .collect(Collectors.toList()))
		                   .pageNumber(page.getNumber())
		                   .pageSize(page.getSize())
		                   .totalElements(page.getTotalElements())
		                   .totalPages(page.getTotalPages())
		                   .last(page.isLast())
		                   .build();
	}

	private PageResponse<CreditTransactionResponse> buildTransactionPageResponse(Page<CreditTransactions> page) {
		return PageResponse.<CreditTransactionResponse>builder()
		                   .content(page.getContent().stream()
		                                .map(this::convertTransactionToResponse)
		                                .collect(Collectors.toList()))
		                   .pageNumber(page.getNumber())
		                   .pageSize(page.getSize())
		                   .totalElements(page.getTotalElements())
		                   .totalPages(page.getTotalPages())
		                   .last(page.isLast())
		                   .build();
	}

	private CarbonCreditResponse convertToResponse(CarbonCredits credit) {
		CarbonCreditResponse response = modelMapper.map(credit, CarbonCreditResponse.class);
		response.setProjectId(credit.getProject().getId());
		response.setProjectName(credit.getProject().getName());
		return response;
	}

	private CreditTransactionResponse convertTransactionToResponse(
			CreditTransactions transaction) {
		CreditTransactionResponse response = modelMapper.map(
				transaction, CreditTransactionResponse.class);
		response.setCreditCode(transaction.getCredit().getCreditCode());
		response.setEnterpriseName(transaction.getEnterprise().getFullname());
		return response;
	}
}
