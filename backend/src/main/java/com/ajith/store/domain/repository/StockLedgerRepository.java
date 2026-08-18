package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.StockLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockLedgerRepository extends JpaRepository<StockLedger, Long> {

    List<StockLedger> findByVariantIdOrderByCreatedAtAsc(Long variantId);

    List<StockLedger> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);

    Page<StockLedger> findByVariantId(Long variantId, Pageable pageable);

    Optional<StockLedger> findTopByVariantIdOrderByCreatedAtDesc(Long variantId);
}
