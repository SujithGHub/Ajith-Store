package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.PurchaseInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {

    Page<PurchaseInvoice> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<PurchaseInvoice> findBySupplierIdOrderByCreatedAtDesc(Long supplierId, Pageable pageable);

    Page<PurchaseInvoice> findByStatus(String status, Pageable pageable);

    Optional<PurchaseInvoice> findByInvoiceNumber(String invoiceNumber);

    @Query(value = "SELECT nextval('seq_purchase_invoice_no')", nativeQuery = true)
    Long nextInvoiceNumber();
}
