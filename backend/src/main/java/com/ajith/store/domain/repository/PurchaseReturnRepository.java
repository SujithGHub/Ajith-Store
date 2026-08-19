package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.PurchaseReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PurchaseReturnRepository extends JpaRepository<PurchaseReturn, Long> {

    Page<PurchaseReturn> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<PurchaseReturn> findBySupplierIdOrderByCreatedAtDesc(Long supplierId, Pageable pageable);

    Optional<PurchaseReturn> findByReturnNumber(String returnNumber);

    @Query(value = "SELECT nextval('seq_return_no')", nativeQuery = true)
    Long nextReturnNumber();
}
