package com.ajith.store.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PermissionUpdateRequest {
    @NotBlank(message = "Role is required")
    private String role;

    private List<PermissionEntry> permissions;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class PermissionEntry {
        @NotBlank(message = "Module is required")
        private String module;

        @NotBlank(message = "Feature is required")
        private String feature;

        private boolean canCreate;
        private boolean canRead;
        private boolean canUpdate;
        private boolean canDelete;
    }
}
