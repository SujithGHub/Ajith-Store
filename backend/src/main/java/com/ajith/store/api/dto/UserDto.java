package com.ajith.store.api.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDto {
    private Long id;
    private Long storeId;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private boolean enabled;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
