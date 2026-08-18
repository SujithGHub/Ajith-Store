package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDto {

    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private String parentName;
    private String imagePath;
    private Integer sortOrder;
    private String status;
    private long childrenCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
