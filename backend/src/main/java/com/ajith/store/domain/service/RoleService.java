package com.ajith.store.domain.service;

import com.ajith.store.api.dto.RoleCreateRequest;
import com.ajith.store.api.dto.RoleDto;
import com.ajith.store.domain.model.Role;
import com.ajith.store.domain.model.RolePermission;
import com.ajith.store.domain.repository.RolePermissionRepository;
import com.ajith.store.domain.repository.RoleRepository;
import com.ajith.store.domain.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRepository userRepository;

    private static final List<String> DEFAULT_MODULES = List.of(
        "STORE_CONFIG", "USERS", "PRODUCTS", "INVENTORY", "SUPPLIERS",
        "PURCHASES", "CUSTOMERS", "SALES", "RETURNS", "EXPENSES",
        "REPORTS", "DASHBOARD", "SETTINGS", "AUDIT"
    );

    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public RoleDto getRole(String role) {
        Role r = roleRepository.findById(role.toUpperCase())
            .orElseThrow(() -> new EntityNotFoundException("Role not found: " + role));
        return toDto(r);
    }

    @Transactional
    public RoleDto createRole(RoleCreateRequest request) {
        String roleName = request.getRole().toUpperCase();
        if (roleRepository.existsById(roleName)) {
            throw new IllegalArgumentException("Role already exists: " + roleName);
        }

        Role role = Role.builder()
            .role(roleName)
            .description(request.getDescription())
            .isSystem(false)
            .build();
        roleRepository.save(role);

        for (String module : DEFAULT_MODULES) {
            RolePermission rp = RolePermission.builder()
                .role(roleName)
                .module(module)
                .feature("MANAGE")
                .canCreate(false)
                .canRead(true)
                .canUpdate(false)
                .canDelete(false)
                .build();
            rolePermissionRepository.save(rp);
        }

        return toDto(role);
    }

    @Transactional
    public RoleDto updateRole(String role, RoleCreateRequest request) {
        Role r = roleRepository.findById(role.toUpperCase())
            .orElseThrow(() -> new EntityNotFoundException("Role not found: " + role));
        if (request.getDescription() != null) {
            r.setDescription(request.getDescription());
        }
        r = roleRepository.save(r);
        return toDto(r);
    }

    @Transactional
    public void deleteRole(String role) {
        String roleName = role.toUpperCase();
        Role r = roleRepository.findById(roleName)
            .orElseThrow(() -> new EntityNotFoundException("Role not found: " + role));

        if (r.getIsSystem()) {
            throw new IllegalArgumentException("Cannot delete system role: " + roleName);
        }

        long userCount = userRepository.findByRole(roleName);
        if (userCount > 0) {
            throw new IllegalArgumentException(
                "Cannot delete role '" + roleName + "': " + userCount + " user(s) are assigned to it");
        }

        rolePermissionRepository.deleteByRole(roleName);
        roleRepository.delete(r);
    }

    private RoleDto toDto(Role role) {
        long userCount = userRepository.findByRole(role.getRole());
        return RoleDto.builder()
            .role(role.getRole())
            .description(role.getDescription())
            .isSystem(role.getIsSystem())
            .createdAt(role.getCreatedAt())
            .userCount(userCount)
            .build();
    }
}
