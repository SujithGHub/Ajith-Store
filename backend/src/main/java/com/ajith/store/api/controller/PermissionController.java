package com.ajith.store.api.controller;

import com.ajith.store.api.dto.ApiResponse;
import com.ajith.store.api.dto.PermissionUpdateRequest;
import com.ajith.store.domain.model.RolePermission;
import com.ajith.store.domain.repository.RolePermissionRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PermissionController {

    private final RolePermissionRepository rolePermissionRepository;

    @GetMapping("/{role}")
    public ResponseEntity<ApiResponse<List<RolePermission>>> getPermissions(@PathVariable String role) {
        List<RolePermission> permissions = rolePermissionRepository.findByRole(role.toUpperCase());
        return ResponseEntity.ok(ApiResponse.success(permissions));
    }

    @PutMapping
    @Transactional
    public ResponseEntity<ApiResponse<Void>> updatePermissions(
            @Valid @RequestBody PermissionUpdateRequest request) {
        String role = request.getRole().toUpperCase();

        rolePermissionRepository.deleteByRole(role);

        if (request.getPermissions() != null) {
            for (PermissionUpdateRequest.PermissionEntry entry : request.getPermissions()) {
                RolePermission rp = RolePermission.builder()
                    .role(role)
                    .module(entry.getModule().toUpperCase())
                    .feature(entry.getFeature().toUpperCase())
                    .canCreate(entry.isCanCreate())
                    .canRead(entry.isCanRead())
                    .canUpdate(entry.isCanUpdate())
                    .canDelete(entry.isCanDelete())
                    .build();
                rolePermissionRepository.save(rp);
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Permissions updated successfully", null));
    }
}
