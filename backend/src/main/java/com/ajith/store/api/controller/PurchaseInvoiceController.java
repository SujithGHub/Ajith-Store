package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.application.security.CurrentUser;
import com.ajith.store.application.security.UserPrincipal;
import com.ajith.store.domain.service.PurchaseInvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/purchase-invoices")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class PurchaseInvoiceController {

    private final PurchaseInvoiceService purchaseInvoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseInvoiceDto>>> getInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(purchaseInvoiceService.getInvoices(page, size, status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseInvoiceDto>> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseInvoiceService.getInvoice(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseInvoiceDto>> createInvoice(
            @Valid @RequestBody PurchaseInvoiceRequest request, @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Purchase invoice created successfully",
            purchaseInvoiceService.createInvoice(request, currentUser.getId())));
    }

    @PatchMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<PurchaseInvoiceDto>> recordPayment(
            @PathVariable Long id, @RequestParam BigDecimal amount, @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Payment recorded",
            purchaseInvoiceService.updateInvoicePayment(id, amount, currentUser.getId())));
    }
}
