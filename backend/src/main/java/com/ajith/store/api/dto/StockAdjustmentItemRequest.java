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
public class StockAdjustmentItemRequest {

    @NotNull(message = "Variant is required")
    private Long variantId;

    @NotNull(message = "Quantity is required")
    private BigDecimal quantity;

    private BigDecimal unitPrice;
    private String reason;
}
