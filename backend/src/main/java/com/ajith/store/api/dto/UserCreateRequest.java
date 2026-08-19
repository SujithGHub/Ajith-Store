package com.ajith.store.api.dto;

import com.ajith.store.application.common.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserCreateRequest {
    @NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required") @ValidPassword
    private String password;

    @NotBlank(message = "Full name is required") @Size(max = 100)
    private String fullName;

    private String email;
    private String phone;

    @NotBlank(message = "Role is required")
    private String role;
}
