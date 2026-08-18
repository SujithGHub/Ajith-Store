package com.ajith.store.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VariantRequest {

    private Long id;
    private Long colorId;
    private Long sizeId;

    @NotBlank
    private String barcode;

    @NotBlank
    private String sku;

    private BigDecimal purchasePrice;
    private BigDecimal landingCost;
    private BigDecimal mrp;
    private BigDecimal sellingPrice;
    private BigDecimal wholesalePrice;
    private BigDecimal openingStock;
    private BigDecimal minStock;
    private BigDecimal reorderLevel;
    private String status;
}
