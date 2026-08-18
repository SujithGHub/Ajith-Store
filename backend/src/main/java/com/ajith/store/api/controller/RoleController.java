package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        return ResponseEntity.ok(ApiResponse.success(roleService.getAllRoles()));
    }

    @GetMapping("/{role}")
    public ResponseEntity<ApiResponse<RoleDto>> getRole(@PathVariable String role) {
        return ResponseEntity.ok(ApiResponse.success(roleService.getRole(role)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleDto>> createRole(
            @Valid @RequestBody RoleCreateRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("Role created successfully", roleService.createRole(request)));
    }

    @PutMapping("/{role}")
    public ResponseEntity<ApiResponse<RoleDto>> updateRole(
            @PathVariable String role,
            @Valid @RequestBody RoleCreateRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("Role updated successfully", roleService.updateRole(role, request)));
    }

    @DeleteMapping("/{role}")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable String role) {
        roleService.deleteRole(role);
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", null));
    }
}
