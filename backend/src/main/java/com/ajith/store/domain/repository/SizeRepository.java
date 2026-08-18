package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SizeRepository extends JpaRepository<Size, Long> {

    Page<Size> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Size> findByStatus(String status);

    List<Size> findAllByOrderByDisplayOrderAsc();
}
