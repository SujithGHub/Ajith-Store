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

    @NotBlank
    private String name;

    @NotNull
    private BigDecimal cgstPct;

    @NotNull
    private BigDecimal sgstPct;

    @NotNull
    private BigDecimal igstPct;
}
