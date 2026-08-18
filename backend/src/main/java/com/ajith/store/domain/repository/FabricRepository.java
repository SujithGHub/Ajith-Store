package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.Fabric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FabricRepository extends JpaRepository<Fabric, Long> {

    Page<Fabric> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Fabric> findByStatus(String status);
}
