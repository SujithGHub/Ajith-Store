package com.ajith.store.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ColorRequest {

    @NotBlank(message = "Color name is required")
    private String name;

    @NotBlank(message = "HEX code is required")
    private String hexCode;
}
