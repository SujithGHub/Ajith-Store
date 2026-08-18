package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.TaxGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaxGroupRepository extends JpaRepository<TaxGroup, Long> {

    Page<TaxGroup> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<TaxGroup> findByStatus(String status);
}
