package com.ajith.store.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChangePasswordRequest {
    @NotBlank
    private String currentPassword;

    @NotBlank @Size(min = 6, max = 100)
    private String newPassword;
}
