package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantDto {

    private Long id;
    private Long productId;
    private String productName;
    private Long colorId;
    private String colorName;
    private String colorHex;
    private Long sizeId;
    private String sizeName;
    private String barcode;
    private String sku;
    private BigDecimal purchasePrice;
    private BigDecimal landingCost;
    private BigDecimal mrp;
    private BigDecimal sellingPrice;
    private BigDecimal wholesalePrice;
    private BigDecimal openingStock;
    private BigDecimal currentStock;
    private BigDecimal minStock;
    private BigDecimal reorderLevel;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
