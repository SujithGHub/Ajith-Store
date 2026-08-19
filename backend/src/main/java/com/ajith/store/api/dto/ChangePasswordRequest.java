package com.ajith.store.api.dto;

import com.ajith.store.application.common.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChangePasswordRequest {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required") @ValidPassword
    private String newPassword;
}
