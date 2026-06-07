package com.ajith.store.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserCreateRequest {
    @NotBlank @Size(min = 3, max = 50)
    private String username;

    @NotBlank @Size(min = 6, max = 100)
    private String password;

    @NotBlank @Size(max = 100)
    private String fullName;

    private String email;
    private String phone;

    @NotBlank
    private String role;
}
