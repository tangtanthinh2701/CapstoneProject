package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.CreditTransactions;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CreditTransactionsRepository extends JpaRepository<CreditTransactions, Integer> {
	Boolean existsByTransactionCode(String transactionCode);

	@Query("SELECT ct FROM CreditTransactions ct WHERE ct.enterprise.id = :enterpriseId")
	Page<CreditTransactions> findByEnterpriseId(@Param("enterpriseId") UUID enterpriseId, Pageable pageable);
}
