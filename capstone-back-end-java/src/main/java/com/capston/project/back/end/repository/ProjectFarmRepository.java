package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.ProjectFarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectFarmRepository extends JpaRepository<ProjectFarm, Integer> {

    List<ProjectFarm> findByProjectId(Integer projectId);

    List<ProjectFarm> findByFarmId(Integer farmId);

    Optional<ProjectFarm> findByProjectIdAndFarmId(Integer projectId, Integer farmId);

    boolean existsByProjectIdAndFarmId(Integer projectId, Integer farmId);

    void deleteByProjectIdAndFarmId(Integer projectId, Integer farmId);
}

