package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
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
public class GrnDto {

    private Long id;
    private String grnNumber;
    private Long purchaseOrderId;
    private String purchaseOrderNumber;
    private Long supplierId;
    private String supplierName;
    private LocalDate receivedDate;
    private String status;
    private String notes;
    private Long createdBy;
    private LocalDateTime createdAt;
    private List<GrnItemDto> items;
}
