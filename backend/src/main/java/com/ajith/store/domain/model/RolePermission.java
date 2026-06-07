package com.ajith.store.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role_permissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"role", "module", "feature"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(nullable = false, length = 50)
    private String module;

    @Column(nullable = false, length = 50)
    private String feature;

    @Column(name = "can_create", nullable = false)
    @Builder.Default
    private Boolean canCreate = false;

    @Column(name = "can_read", nullable = false)
    @Builder.Default
    private Boolean canRead = true;

    @Column(name = "can_update", nullable = false)
    @Builder.Default
    private Boolean canUpdate = false;

    @Column(name = "can_delete", nullable = false)
    @Builder.Default
    private Boolean canDelete = false;
}
