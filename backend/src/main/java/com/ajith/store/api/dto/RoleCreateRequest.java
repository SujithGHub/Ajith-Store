package com.ajith.store.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RoleCreateRequest {
    @NotBlank @Size(min = 2, max = 50)
    private String role;

    @Size(max = 255)
    private String description;
}
