package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.entity.AnnualGrowthData;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.TreeSpecies;
import com.capston.project.back.end.repository.AnnualGrowthDataRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.AnnualGrowthDataRequest;
import com.capston.project.back.end.response.AnnualGrowthDataResponse;
import com.capston.project.back.end.response.TreeSpeciesSimpleResponse;
import com.capston.project.back.end.service.AnnualGrowthDataService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnualGrowthDataServiceImpl implements AnnualGrowthDataService {
	private final AnnualGrowthDataRepository growthDataRepository;
	private final ProjectRepository projectRepository;
	private final TreeSpeciesRepository treeSpeciesRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;


	@Override
	public AnnualGrowthDataResponse createOrUpdateGrowthData(AnnualGrowthDataRequest request, UUID recorderId) {
		Project project = projectRepository.findById(request.getProjectId())
		                                   .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
		TreeSpecies treeSpecies = treeSpeciesRepository.findById(request.getTreeSpeciesId())
		                                               .orElseThrow(() -> new ResourceNotFoundException("TreeSpecies not found with id: " + request.getTreeSpeciesId()));
		User recorder = userRepository.findById(recorderId)
		                              .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + recorderId));

		BigDecimal co2Absorbed = calculateCO2Absorbed(request.getTreesAlive(),
		                                              treeSpecies.getCarbonAbsorptionRate(),
		                                              request.getReportYear(),
		                                              project.getPlantingDate().getYear(),
		                                              request.getSurvivalRate());

		// Kiểm tra xem đã có dữ liệu cho năm này chưa
		AnnualGrowthData growthData = growthDataRepository.findByProjectIdAndTreeSpeciesIdAndReportYear(request.getProjectId(),
		                                                                                                request.getTreeSpeciesId(),
		                                                                                                request.getReportYear())
		                                                  .orElse(AnnualGrowthData.builder()
		                                                                          .project(project)
		                                                                          .treeSpecies(treeSpecies)
		                                                                          .reportYear(request.getReportYear())
		                                                                          .build());

		// Update data
		growthData.setTreesAlive(request.getTreesAlive());
		growthData.setAvgHeight(request.getAvgHeight());
		growthData.setAvgCanopyDiameter(request.getAvgCanopyDiameter());
		growthData.setAvgTrunkDiameter(request.getAvgTrunkDiameter());
		growthData.setSurvivalRate(request.getSurvivalRate());
		growthData.setHealthStatus(request.getHealthStatus());
		growthData.setDiseases(request.getDiseases());
		growthData.setCo2Absorbed(co2Absorbed);
		growthData.setNotes(request.getNotes());
		growthData.setRecordedBy(recorder);
		AnnualGrowthData saved = growthDataRepository.save(growthData);
		return convertToResponse(saved);
	}

	@Override
	public List<AnnualGrowthDataResponse> getGrowthDataByProject(Integer projectId) {
		List<AnnualGrowthData> dataList = growthDataRepository.findByProjectIdOrderByReportYearDesc(projectId);

		return dataList.stream()
		               .map(this::convertToResponse)
		               .collect(Collectors.toList());
	}

	@Override
	public List<AnnualGrowthDataResponse> getGrowthDataByProjectAndYear(Integer projectId, Integer year) {
		List<AnnualGrowthData> dataList = growthDataRepository.findByProjectAndYearWithTreeSpecies(projectId, year);

		return dataList.stream()
		               .map(this::convertToResponse)
		               .collect(Collectors.toList());
	}

	private BigDecimal calculateCO2Absorbed(Integer treesAlive, BigDecimal carbonAbsorptionRate, Integer reportYear,
	                                        Integer plantingYear, BigDecimal survivalRate) {
		if (treesAlive == null || treesAlive == 0) {
			return BigDecimal.ZERO;
		}

		// Tuổi cây
		int treeAge = reportYear - plantingYear;
		if (treeAge < 0) {
			treeAge = 0;
		}

		// CO2 = số_cây × k_i × tuổi_cây × survival_rate
		BigDecimal co2 = BigDecimal.valueOf(treesAlive).multiply(carbonAbsorptionRate).multiply(
				BigDecimal.valueOf(treeAge));

		if (survivalRate != null) {
			co2 = co2.multiply(survivalRate);
		}

		return co2.setScale(2, RoundingMode.HALF_UP);
	}

	private AnnualGrowthDataResponse convertToResponse(AnnualGrowthData data) {
		AnnualGrowthDataResponse response = modelMapper.map(data, AnnualGrowthDataResponse.class);
		response.setProjectId(data.getProject().getId());
		response.setProjectName(data.getProject().getName());

		TreeSpeciesSimpleResponse treeSpeciesResponse = modelMapper.map(data.getTreeSpecies(),
		                                                                TreeSpeciesSimpleResponse.class);
		response.setTreeSpecies(treeSpeciesResponse);

		return response;
	}
}
