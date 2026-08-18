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
public class ManufacturerRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String contactPerson;

    @NotBlank
    private String mobile;

    @NotBlank
    private String email;

    @NotBlank
    private String address;
}
