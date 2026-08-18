package com.ajith.store.api.dto;

import com.ajith.store.application.common.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChangePasswordRequest {
    @NotBlank
    private String currentPassword;

    @NotBlank @ValidPassword
    private String newPassword;
}
