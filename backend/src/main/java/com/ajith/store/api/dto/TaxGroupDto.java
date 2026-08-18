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
public class TaxGroupDto {

    private Long id;
    private String name;
    private BigDecimal cgstPct;
    private BigDecimal sgstPct;
    private BigDecimal igstPct;
    private String status;
    private LocalDateTime createdAt;
}
