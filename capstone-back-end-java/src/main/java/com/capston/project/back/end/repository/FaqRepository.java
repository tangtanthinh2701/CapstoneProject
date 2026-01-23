package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Integer> {

    List<Faq> findByCategoryAndIsActiveTrueOrderByPriorityDesc(String category);

    @Query("SELECT f FROM Faq f WHERE f.isActive = true AND " +
           "(LOWER(f.question) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.answer) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY f.priority DESC")
    List<Faq> searchByQuestion(@Param("query") String query);
}

