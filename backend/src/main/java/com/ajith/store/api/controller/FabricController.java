package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.service.FabricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fabrics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class FabricController {

    private final FabricService fabricService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FabricDto>>> getAllFabrics() {
        return ResponseEntity.ok(ApiResponse.success(fabricService.getAllFabrics()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FabricDto>> getFabric(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(fabricService.getFabric(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FabricDto>> createFabric(@Valid @RequestBody FabricRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Fabric created successfully", fabricService.createFabric(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FabricDto>> updateFabric(@PathVariable Long id, @Valid @RequestBody FabricRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Fabric updated successfully", fabricService.updateFabric(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<FabricDto>> toggleFabricStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Fabric status toggled", fabricService.toggleFabricStatus(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFabric(@PathVariable Long id) {
        fabricService.deleteFabric(id);
        return ResponseEntity.ok(ApiResponse.success("Fabric deleted successfully", null));
    }
}
