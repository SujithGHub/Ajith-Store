package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameAndEnabledTrue(String username);
    boolean existsByUsername(String username);
    Page<User> findByStoreId(Long storeId, Pageable pageable);
}
