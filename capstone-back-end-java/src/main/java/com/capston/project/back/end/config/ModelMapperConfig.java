package com.capston.project.back.end.config;

import com.capston.project.back.end.common.PhaseStatus;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.ProjectPhase;
import com.capston.project.back.end.request.ProjectPhaseRequest;
import com.capston.project.back.end.request.ProjectRequest;
import com.capston.project.back.end.response.ProjectPhaseResponse;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
	@Bean
	public ModelMapper modelMapper() {
		ModelMapper modelMapper = new ModelMapper();
		// Cấu hình chung
		modelMapper.getConfiguration()
				.setMatchingStrategy(MatchingStrategies.STRICT)
				.setSkipNullEnabled(true)
				.setFieldMatchingEnabled(true)
				.setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE);

		// Custom mapping cho ProjectPhase -> ProjectPhaseResponse
		modelMapper.addMappings(new PropertyMap<ProjectPhase, ProjectPhaseResponse>() {
			@Override
			protected void configure() {
				map().setProjectId(source.getProjectId());
			}
		});

		// Custom mapping cho ProjectRequest -> Project (bỏ qua computed fields)
		modelMapper.addMappings(new PropertyMap<ProjectRequest, Project>() {
			@Override
			protected void configure() {
				skip(destination.getId());
				skip(destination.getCode());
				skip(destination.getTotalBudget());
				skip(destination.getTargetCo2Kg());
				skip(destination.getActualCo2Kg());
				skip(destination.getCreatedAt());
				skip(destination.getUpdatedAt());
				skip(destination.getPhases());
			}
		});

		// Custom mapping cho ProjectPhaseRequest -> ProjectPhase (bỏ qua computed
		// fields)
		modelMapper.addMappings(new PropertyMap<ProjectPhaseRequest, ProjectPhase>() {
			@Override
			protected void configure() {
				skip(destination.getId());
				skip(destination.getProject());
				skip(destination.getActualCost());
				skip(destination.getActualCo2Kg());
				skip(destination.getCreatedAt());
				skip(destination.getUpdatedAt());
			}
		});

		// Converter cho PhaseStatus null handling
		Converter<PhaseStatus, PhaseStatus> phaseStatusConverter = ctx -> ctx.getSource() != null ? ctx.getSource()
				: PhaseStatus.PLANNING;

		modelMapper.typeMap(ProjectPhaseRequest.class, ProjectPhase.class)
				.addMappings(mapper -> mapper.using(phaseStatusConverter)
						.map(ProjectPhaseRequest::getPhaseStatus, ProjectPhase::setPhaseStatus));
		return modelMapper;
	}
}
