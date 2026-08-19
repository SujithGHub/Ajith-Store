package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.application.security.CurrentUser;
import com.ajith.store.application.security.UserPrincipal;
import com.ajith.store.domain.service.PurchaseReturnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-returns")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class PurchaseReturnController {

    private final PurchaseReturnService purchaseReturnService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseReturnDto>>> getReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(purchaseReturnService.getReturns(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseReturnDto>> getReturn(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseReturnService.getReturn(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseReturnDto>> createReturn(
            @Valid @RequestBody PurchaseReturnRequest request, @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Purchase return created successfully",
            purchaseReturnService.createReturn(request, currentUser.getId())));
    }
}
