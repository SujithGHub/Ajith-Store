package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.SupplierTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierTransactionRepository extends JpaRepository<SupplierTransaction, Long> {

    Page<SupplierTransaction> findBySupplierIdOrderByTransactionDateDesc(Long supplierId, Pageable pageable);

    List<SupplierTransaction> findBySupplierIdOrderByTransactionDateDesc(Long supplierId);
}
