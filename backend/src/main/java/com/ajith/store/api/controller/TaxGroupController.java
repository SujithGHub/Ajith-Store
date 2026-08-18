package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.service.TaxGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tax-groups")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class TaxGroupController {

    private final TaxGroupService taxGroupService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaxGroupDto>>> getAllTaxGroups() {
        return ResponseEntity.ok(ApiResponse.success(taxGroupService.getAllTaxGroups()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxGroupDto>> getTaxGroup(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taxGroupService.getTaxGroup(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaxGroupDto>> createTaxGroup(@Valid @RequestBody TaxGroupRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tax group created successfully", taxGroupService.createTaxGroup(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxGroupDto>> updateTaxGroup(@PathVariable Long id, @Valid @RequestBody TaxGroupRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tax group updated successfully", taxGroupService.updateTaxGroup(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaxGroupDto>> toggleTaxGroupStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Tax group status toggled", taxGroupService.toggleTaxGroupStatus(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTaxGroup(@PathVariable Long id) {
        taxGroupService.deleteTaxGroup(id);
        return ResponseEntity.ok(ApiResponse.success("Tax group deleted successfully", null));
    }
}
