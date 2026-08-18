package com.ajith.store.api.dto;

import java.math.BigDecimal;

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
public class InventoryAlertDto {

    private Long variantId;
    private String productName;
    private String barcode;
    private String colorName;
    private String sizeName;
    private BigDecimal currentStock;
    private BigDecimal minStock;
    private BigDecimal reorderLevel;
    private String alertType;
}
