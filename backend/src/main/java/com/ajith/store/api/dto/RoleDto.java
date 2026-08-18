package com.ajith.store.api.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoleDto {
    private String role;
    private String description;
    private boolean isSystem;
    private LocalDateTime createdAt;
    private long userCount;
}
