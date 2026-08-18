package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.Manufacturer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManufacturerRepository extends JpaRepository<Manufacturer, Long> {

    Page<Manufacturer> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Manufacturer> findByStatus(String status);
}
