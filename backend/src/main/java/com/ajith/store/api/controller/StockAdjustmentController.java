package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.application.security.CurrentUser;
import com.ajith.store.application.security.UserPrincipal;
import com.ajith.store.domain.service.StockAdjustmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock-adjustments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class StockAdjustmentController {

    private final StockAdjustmentService stockAdjustmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<StockAdjustmentDto>>> getAdjustments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(stockAdjustmentService.getAdjustments(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockAdjustmentDto>> getAdjustment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(stockAdjustmentService.getAdjustment(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockAdjustmentDto>> createAdjustment(
            @Valid @RequestBody StockAdjustmentRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(
            ApiResponse.success("Stock adjustment created", stockAdjustmentService.createAdjustment(request, currentUser.getId())));
    }
}
