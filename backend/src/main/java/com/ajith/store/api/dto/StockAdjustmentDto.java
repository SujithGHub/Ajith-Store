package com.ajith.store.api.dto;

import java.time.LocalDateTime;
import java.util.List;

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
public class StockAdjustmentDto {

    private Long id;
    private String adjustmentNumber;
    private String adjustmentType;
    private String reason;
    private String notes;
    private Long createdBy;
    private LocalDateTime createdAt;
    private String status;
    private List<StockAdjustmentItemDto> items;
}
