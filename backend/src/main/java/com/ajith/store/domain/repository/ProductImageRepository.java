package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductId(Long productId);

    void deleteByProductId(Long productId);
}
