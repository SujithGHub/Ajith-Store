package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProductListDto>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProducts(page, size, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProduct(id)));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ApiResponse<VariantDto>> lookupByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(ApiResponse.success(productService.lookupByBarcode(barcode)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", productService.createProduct(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", productService.updateProduct(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductDto>> toggleProductStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Product status toggled", productService.toggleProductStatus(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @GetMapping("/alerts/low-stock")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<VariantDto>>> getLowStockAlerts() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStockAlerts()));
    }

    @GetMapping("/alerts/reorder")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<VariantDto>>> getReorderAlerts() {
        return ResponseEntity.ok(ApiResponse.success(productService.getReorderAlerts()));
    }

    @GetMapping("/{variantId}/ledger")
    public ResponseEntity<ApiResponse<PagedResponse<StockLedgerDto>>> getVariantLedger(
            @PathVariable Long variantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(productService.getVariantLedger(variantId, page, size)));
    }
}
