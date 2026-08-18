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

    @NotNull
    private Long variantId;

    @NotNull
    private BigDecimal quantity;

    private BigDecimal unitPrice;
    private String reason;
}
