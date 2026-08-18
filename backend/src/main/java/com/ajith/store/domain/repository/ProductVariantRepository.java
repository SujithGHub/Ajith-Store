package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    Optional<ProductVariant> findByBarcode(String barcode);

    Optional<ProductVariant> findBySku(String sku);

    List<ProductVariant> findByProductId(Long productId);

    List<ProductVariant> findByProductIdAndStatus(Long productId, String status);

    List<ProductVariant> findByCurrentStockLessThanEqual(BigDecimal threshold);

    List<ProductVariant> findByCurrentStockLessThanEqualAndMinStockGreaterThan(BigDecimal currentStock, BigDecimal minStock);

    Page<ProductVariant> findByStatus(String status, Pageable pageable);
}
