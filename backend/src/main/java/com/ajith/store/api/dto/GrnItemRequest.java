package com.ajith.store.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GrnItemRequest {

    @NotNull(message = "Variant is required")
    private Long variantId;

    private BigDecimal orderedQty;
    private BigDecimal receivedQty;
    private BigDecimal acceptedQty;
    private BigDecimal rejectedQty;
    private String rejectionReason;
}
