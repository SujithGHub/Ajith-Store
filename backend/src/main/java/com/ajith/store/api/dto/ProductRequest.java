package com.ajith.store.api.dto;

import java.util.List;

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
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Item code is required")
    private String itemCode;

    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private Long subcategoryId;
    private Long brandId;
    private Long manufacturerId;

    private String unit = "PCS";

    private Long fabricId;
    private Long patternId;
    private String gender;
    private String ageGroup;
    private String hsnCode;
    private Boolean gstApplicable;
    private Long taxGroupId;
    private String imagePath;
    private String status;

    private List<VariantRequest> variants;
}
