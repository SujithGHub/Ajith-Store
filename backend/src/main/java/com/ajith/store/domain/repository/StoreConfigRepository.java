package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.StoreConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreConfigRepository extends JpaRepository<StoreConfig, Long> {
}
