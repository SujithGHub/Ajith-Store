package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    Page<Brand> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Brand> findByStatus(String status);

    boolean existsByNameIgnoreCase(String name);
}
