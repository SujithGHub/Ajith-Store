package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.service.ManufacturerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ManufacturerController {

    private final ManufacturerService manufacturerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ManufacturerDto>>> getAllManufacturers() {
        return ResponseEntity.ok(ApiResponse.success(manufacturerService.getAllManufacturers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ManufacturerDto>> getManufacturer(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(manufacturerService.getManufacturerById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ManufacturerDto>> createManufacturer(@Valid @RequestBody ManufacturerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Manufacturer created successfully", manufacturerService.createManufacturer(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ManufacturerDto>> updateManufacturer(@PathVariable Long id, @Valid @RequestBody ManufacturerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Manufacturer updated successfully", manufacturerService.updateManufacturer(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ManufacturerDto>> toggleManufacturerStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Manufacturer status toggled", manufacturerService.toggleStatus(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteManufacturer(@PathVariable Long id) {
        manufacturerService.deleteManufacturer(id);
        return ResponseEntity.ok(ApiResponse.success("Manufacturer deleted successfully", null));
    }
}
