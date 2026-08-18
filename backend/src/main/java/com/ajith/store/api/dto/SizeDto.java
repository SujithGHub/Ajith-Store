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
public class SizeDto {

    private Long id;
    private String name;
    private Integer displayOrder;
    private String status;
    private LocalDateTime createdAt;
}
