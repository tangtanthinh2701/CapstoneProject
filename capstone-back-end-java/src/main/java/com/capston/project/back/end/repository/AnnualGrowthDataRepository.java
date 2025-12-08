package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.AnnualGrowthData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnualGrowthDataRepository extends JpaRepository<AnnualGrowthData, Integer> {
	List<AnnualGrowthData> findByProjectIdOrderByReportYearDesc(Integer projectId);

	List<AnnualGrowthData> findByProjectIdAndReportYear(Integer projectId, Integer reportYear);

	Optional<AnnualGrowthData> findByProjectIdAndTreeSpeciesIdAndReportYear(Integer projectId, Integer treeSpeciesId, Integer reportYear);

	@Query("SELECT agd FROM AnnualGrowthData agd " +
	       "JOIN FETCH agd.treeSpecies " +
	       "WHERE agd.project.id = :projectId AND agd.reportYear = :year")
	List<AnnualGrowthData> findByProjectAndYearWithTreeSpecies(@Param("projectId") Integer projectId, @Param("year") Integer year);
}
