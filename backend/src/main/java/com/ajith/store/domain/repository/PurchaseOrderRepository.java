package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Page<PurchaseOrder> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<PurchaseOrder> findBySupplierIdOrderByCreatedAtDesc(Long supplierId, Pageable pageable);

    Page<PurchaseOrder> findByStatus(String status, Pageable pageable);

    List<PurchaseOrder> findByStatus(String status);

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    @Query(value = "SELECT nextval('seq_purchase_order_no')", nativeQuery = true)
    Long nextOrderNumber();
}
