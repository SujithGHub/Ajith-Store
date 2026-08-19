package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.application.security.CurrentUser;
import com.ajith.store.application.security.UserPrincipal;
import com.ajith.store.domain.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseOrderDto>>> getPurchaseOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getPurchaseOrders(page, size, status)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<java.util.List<PurchaseOrderDto>>> getAvailableOrders(
            @RequestParam(required = false) Long supplierId) {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getActiveOrdersForGrn(supplierId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getPurchaseOrder(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequest request, @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Purchase order created successfully",
            purchaseOrderService.createPurchaseOrder(request, currentUser.getId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> updatePurchaseOrder(
            @PathVariable Long id, @Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Purchase order updated successfully",
            purchaseOrderService.updatePurchaseOrder(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> updateOrderStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Purchase order status updated",
            purchaseOrderService.updateOrderStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase order deleted successfully", null));
    }
}
