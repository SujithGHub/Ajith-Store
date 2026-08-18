package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.Color;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ColorRepository extends JpaRepository<Color, Long> {

    Page<Color> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Color> findByStatus(String status);
}
