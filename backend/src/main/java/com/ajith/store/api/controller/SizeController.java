package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.service.SizeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sizes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class SizeController {

    private final SizeService sizeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SizeDto>>> getAllSizes() {
        return ResponseEntity.ok(ApiResponse.success(sizeService.getAllSizes()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SizeDto>> getSize(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(sizeService.getSize(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SizeDto>> createSize(@Valid @RequestBody SizeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Size created successfully", sizeService.createSize(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SizeDto>> updateSize(@PathVariable Long id, @Valid @RequestBody SizeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Size updated successfully", sizeService.updateSize(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SizeDto>> toggleSizeStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Size status toggled", sizeService.toggleSizeStatus(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSize(@PathVariable Long id) {
        sizeService.deleteSize(id);
        return ResponseEntity.ok(ApiResponse.success("Size deleted successfully", null));
    }
}
