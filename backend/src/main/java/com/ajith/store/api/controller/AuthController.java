package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.application.security.CurrentUser;
import com.ajith.store.application.security.UserPrincipal;
import com.ajith.store.domain.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        TokenResponse response = authService.login(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CurrentUser UserPrincipal principal,
            HttpServletRequest httpRequest) {
        authService.logout(principal, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(
            @CurrentUser UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
            UserDto.builder()
                .id(principal.getId())
                .username(principal.getUsername())
                .fullName(principal.getFullName())
                .role(principal.getRole())
                .storeId(principal.getStoreId())
                .build()
        ));
    }
}
