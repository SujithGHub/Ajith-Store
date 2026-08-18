package com.ajith.store.api.dto;

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
public class BrandDto {

    private Long id;
    private String name;
    private String description;
    private String imagePath;
    private String status;
    private long productCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
