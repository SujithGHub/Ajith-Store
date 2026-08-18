package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
public class ProductListDto {

    private Long id;
    private String itemCode;
    private String name;
    private String categoryName;
    private String brandName;
    private String status;
    private int variantCount;
    private BigDecimal totalStock;
    private LocalDateTime createdAt;
}
