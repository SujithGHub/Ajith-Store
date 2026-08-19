package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.GoodsReceiptNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface GoodsReceiptNoteRepository extends JpaRepository<GoodsReceiptNote, Long> {

    Page<GoodsReceiptNote> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<GoodsReceiptNote> findByPurchaseOrderIdOrderByCreatedAtDesc(Long purchaseOrderId, Pageable pageable);

    Optional<GoodsReceiptNote> findByGrnNumber(String grnNumber);

    @Query(value = "SELECT nextval('seq_grn_no')", nativeQuery = true)
    Long nextGrnNumber();
}
