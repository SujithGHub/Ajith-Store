package com.ajith.store.api.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentRequest {

    @NotBlank(message = "Adjustment type is required")
    private String adjustmentType;

    private String reason;
    private String notes;

    @NotNull(message = "Items are required")
    @NotEmpty(message = "At least one adjustment item is required")
    private List<StockAdjustmentItemRequest> items;
}
