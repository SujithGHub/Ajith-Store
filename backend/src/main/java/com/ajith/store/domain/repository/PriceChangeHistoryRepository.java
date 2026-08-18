package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.PriceChangeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceChangeHistoryRepository extends JpaRepository<PriceChangeHistory, Long> {

    List<PriceChangeHistory> findByVariantIdOrderByChangedAtDesc(Long variantId);

    Page<PriceChangeHistory> findByVariantId(Long variantId, Pageable pageable);
}
