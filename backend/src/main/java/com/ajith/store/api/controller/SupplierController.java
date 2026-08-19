package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SupplierDto>>> getSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSuppliers(page, size, search)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<SupplierDto>>> getActiveSuppliers() {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getAllActiveSuppliers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDto>> getSupplier(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplier(id)));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<ApiResponse<PagedResponse<SupplierTransactionDto>>> getSupplierTransactions(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierTransactions(id, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Supplier created successfully", supplierService.createSupplier(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDto>> updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Supplier updated successfully", supplierService.updateSupplier(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SupplierDto>> toggleSupplierStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Supplier status toggled", supplierService.toggleSupplierStatus(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier deleted successfully", null));
    }
}
