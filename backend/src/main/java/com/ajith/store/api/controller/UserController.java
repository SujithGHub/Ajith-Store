package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.application.security.CurrentUser;
import com.ajith.store.application.security.UserPrincipal;
import com.ajith.store.domain.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUsers(page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @Valid @RequestBody UserCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        UserDto user = userService.createUser(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        UserDto user = userService.updateUser(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    @PostMapping("/{id}/change-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request,
            @CurrentUser UserPrincipal currentUser) {
        userService.changePassword(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        userService.toggleUserStatus(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("User status toggled", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changeOwnPassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @CurrentUser UserPrincipal currentUser) {
        userService.changePassword(currentUser.getId(), request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
