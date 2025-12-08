package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.ProjectPhase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectPhaseRepository extends JpaRepository<ProjectPhase, Integer> {
	List<ProjectPhase> findByProjectId(Integer projectId);
}
