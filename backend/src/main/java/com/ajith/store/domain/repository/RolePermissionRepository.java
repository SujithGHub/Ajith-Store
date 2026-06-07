package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRole(String role);
}
