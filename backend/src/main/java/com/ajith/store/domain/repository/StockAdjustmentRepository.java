package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.StockAdjustment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {

    Page<StockAdjustment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Optional<StockAdjustment> findByAdjustmentNumber(String adjustmentNumber);
}
