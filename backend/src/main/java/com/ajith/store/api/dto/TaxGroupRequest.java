package com.ajith.store.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaxGroupRequest {

    @NotBlank(message = "Tax group name is required")
    private String name;

    @NotNull(message = "CGST percentage is required")
    private BigDecimal cgstPct;

    @NotNull(message = "SGST percentage is required")
    private BigDecimal sgstPct;

    @NotNull(message = "IGST percentage is required")
    private BigDecimal igstPct;
}
