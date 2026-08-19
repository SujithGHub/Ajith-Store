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
public class GrnItemDto {

    private Long id;
    private Long variantId;
    private String variantName;
    private String barcode;
    private String colorName;
    private String sizeName;
    private BigDecimal orderedQty;
    private BigDecimal receivedQty;
    private BigDecimal acceptedQty;
    private BigDecimal rejectedQty;
    private String rejectionReason;
}
