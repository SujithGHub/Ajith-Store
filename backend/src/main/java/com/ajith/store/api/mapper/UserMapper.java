package com.ajith.store.api.mapper;

import com.ajith.store.api.dto.UserCreateRequest;
import com.ajith.store.api.dto.UserDto;
import com.ajith.store.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        return UserDto.builder()
            .id(user.getId())
            .storeId(user.getStoreId())
            .username(user.getUsername())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .role(user.getRole())
            .enabled(user.getEnabled())
            .lastLoginAt(user.getLastLoginAt())
            .createdAt(user.getCreatedAt())
            .build();
    }

    public User toEntity(UserCreateRequest request, String passwordHash) {
        return User.builder()
            .username(request.getUsername())
            .passwordHash(passwordHash)
            .fullName(request.getFullName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .role(request.getRole())
            .enabled(true)
            .build();
    }

    public void updateEntity(User user, UserCreateRequest request, String passwordHash) {
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordHash);
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
    }
}
