package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Page<Supplier> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Supplier> findByStatus(String status);

    boolean existsByNameIgnoreCase(String name);
}
