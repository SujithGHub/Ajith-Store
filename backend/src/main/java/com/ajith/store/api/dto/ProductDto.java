package com.ajith.store.api.dto;

import java.math.BigDecimal;
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
public class ProductDto {

    private Long id;
    private String name;
    private String itemCode;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long subcategoryId;
    private String subcategoryName;
    private Long brandId;
    private String brandName;
    private Long manufacturerId;
    private String manufacturerName;
    private String unit;
    private Long fabricId;
    private String fabricName;
    private Long patternId;
    private String patternName;
    private String gender;
    private String ageGroup;
    private String hsnCode;
    private Boolean gstApplicable;
    private Long taxGroupId;
    private String taxGroupName;
    private BigDecimal cgstPct;
    private BigDecimal sgstPct;
    private BigDecimal igstPct;
    private String imagePath;
    private String status;

    private List<VariantDto> variants;
}
