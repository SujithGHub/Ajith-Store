package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.application.security.CurrentUser;
import com.ajith.store.application.security.UserPrincipal;
import com.ajith.store.domain.service.GoodsReceiptNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/grns")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class GoodsReceiptNoteController {

    private final GoodsReceiptNoteService grnService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<GrnDto>>> getGrns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(grnService.getGrns(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GrnDto>> getGrn(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(grnService.getGrn(id)));
    }

    @GetMapping("/pending-order/{purchaseOrderId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPendingOrderDetails(@PathVariable Long purchaseOrderId) {
        return ResponseEntity.ok(ApiResponse.success(grnService.getPendingOrderDetails(purchaseOrderId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GrnDto>> createGrn(
            @Valid @RequestBody GrnRequest request, @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success("GRN created successfully",
            grnService.createGrn(request, currentUser.getId())));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<GrnDto>> approveGrn(@PathVariable Long id, @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success("GRN approved, stock updated",
            grnService.approveGrn(id, currentUser.getId())));
    }
}
