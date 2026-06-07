package com.ajith.store.api.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserUpdateRequest {
    @Size(max = 100)
    private String fullName;

    private String email;
    private String phone;

    @Size(max = 20)
    private String role;

    private Boolean enabled;
}
