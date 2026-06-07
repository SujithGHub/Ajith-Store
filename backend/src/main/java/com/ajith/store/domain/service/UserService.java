package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.api.mapper.UserMapper;
import com.ajith.store.application.security.UserPrincipal;
import com.ajith.store.domain.model.AuditLog;
import com.ajith.store.domain.model.User;
import com.ajith.store.domain.repository.AuditLogRepository;
import com.ajith.store.domain.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.findAll(pageable);

        return PagedResponse.<UserDto>builder()
            .content(userPage.getContent().stream().map(userMapper::toDto).toList())
            .page(userPage.getNumber())
            .size(userPage.getSize())
            .totalElements(userPage.getTotalElements())
            .totalPages(userPage.getTotalPages())
            .first(userPage.isFirst())
            .last(userPage.isLast())
            .build();
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto createUser(UserCreateRequest request, UserPrincipal currentUser) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = userMapper.toEntity(request, passwordEncoder.encode(request.getPassword()));
        user.setStoreId(currentUser.getStoreId());
        user = userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
            .userId(currentUser.getId())
            .username(currentUser.getUsername())
            .action("CREATE_USER")
            .entityType("User")
            .entityId(user.getId())
            .details("Created user: " + user.getUsername())
            .build());

        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());
        user = userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
            .userId(currentUser.getId())
            .username(currentUser.getUsername())
            .action("UPDATE_USER")
            .entityType("User")
            .entityId(user.getId())
            .details("Updated user: " + user.getUsername())
            .build());

        return userMapper.toDto(user);
    }

    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
            .userId(currentUser.getId())
            .username(currentUser.getUsername())
            .action("CHANGE_PASSWORD")
            .entityType("User")
            .entityId(user.getId())
            .details("Password changed for user: " + user.getUsername())
            .build());
    }

    @Transactional
    public void toggleUserStatus(Long id, UserPrincipal currentUser) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        user.setEnabled(!user.getEnabled());
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
            .userId(currentUser.getId())
            .username(currentUser.getUsername())
            .action(user.getEnabled() ? "ENABLE_USER" : "DISABLE_USER")
            .entityType("User")
            .entityId(user.getId())
            .details("User " + (user.getEnabled() ? "enabled" : "disabled") + ": " + user.getUsername())
            .build());
    }
}
