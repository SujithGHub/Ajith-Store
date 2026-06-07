package com.ajith.store.domain.service;

import com.ajith.store.domain.model.RolePermission;
import com.ajith.store.domain.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final RolePermissionRepository rolePermissionRepository;

    @Transactional(readOnly = true)
    public List<RolePermission> getPermissionsByRole(String role) {
        return rolePermissionRepository.findByRole(role);
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(String role, String module, String feature, String action) {
        List<RolePermission> permissions = rolePermissionRepository.findByRole(role);
        return permissions.stream()
            .filter(p -> p.getModule().equals(module) && p.getFeature().equals(feature))
            .findFirst()
            .map(p -> switch (action.toLowerCase()) {
                case "create" -> p.getCanCreate();
                case "read" -> p.getCanRead();
                case "update" -> p.getCanUpdate();
                case "delete" -> p.getCanDelete();
                default -> false;
            })
            .orElse(false);
    }
}
