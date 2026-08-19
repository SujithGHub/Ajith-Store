package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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
public class GrnRequest {

    @NotNull(message = "Purchase order is required")
    private Long purchaseOrderId;

    private LocalDate receivedDate;
    private String notes;

    @NotEmpty(message = "At least one GRN item is required")
    private List<GrnItemRequest> items;
}
