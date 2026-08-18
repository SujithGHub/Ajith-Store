package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatternRepository extends JpaRepository<Pattern, Long> {

    Page<Pattern> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Pattern> findByStatus(String status);
}
