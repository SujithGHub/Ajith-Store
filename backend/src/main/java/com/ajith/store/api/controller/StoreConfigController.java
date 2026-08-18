package com.ajith.store.api.controller;

import com.ajith.store.api.dto.ApiResponse;
import com.ajith.store.api.dto.StoreConfigDto;
import com.ajith.store.api.dto.StoreConfigRequest;
import com.ajith.store.domain.service.StoreConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/store-config")
@RequiredArgsConstructor
public class StoreConfigController {

    private final StoreConfigService storeConfigService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StoreConfigDto>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success(storeConfigService.getConfig()));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StoreConfigDto>> updateConfig(
            @Valid @RequestBody StoreConfigRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("Store configuration updated", storeConfigService.updateConfig(request)));
    }
}
