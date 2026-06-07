package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.api.mapper.UserMapper;
import com.ajith.store.application.security.CustomUserDetailsService;
import com.ajith.store.application.security.JwtTokenProvider;
import com.ajith.store.application.security.UserPrincipal;
import com.ajith.store.domain.model.AuditLog;
import com.ajith.store.domain.model.User;
import com.ajith.store.domain.repository.AuditLogRepository;
import com.ajith.store.domain.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserMapper userMapper;

    @Transactional
    public TokenResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid username or password");
        } catch (DisabledException e) {
            throw new DisabledException("Account is disabled");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLoginAt(java.time.LocalDateTime.now());
        user.setLastLoginIp(httpRequest.getRemoteAddr());
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
            .userId(user.getId())
            .username(user.getUsername())
            .action("LOGIN")
            .entityType("AUTH")
            .ipAddress(httpRequest.getRemoteAddr())
            .build());

        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(principal);

        return new TokenResponse(accessToken, refreshToken, jwtTokenProvider.getAccessTokenExpiration(),
            userMapper.toDto(user));
    }

    public TokenResponse refresh(RefreshTokenRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        String username = jwtTokenProvider.getUsernameFromToken(request.getRefreshToken());
        UserPrincipal principal = (UserPrincipal) userDetailsService.loadUserByUsername(username);

        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(principal);

        return new TokenResponse(accessToken, refreshToken, jwtTokenProvider.getAccessTokenExpiration(),
            userMapper.toDto(userRepository.findByUsername(username).orElseThrow()));
    }

    @Transactional
    public void logout(UserPrincipal principal, HttpServletRequest httpRequest) {
        auditLogRepository.save(AuditLog.builder()
            .userId(principal.getId())
            .username(principal.getUsername())
            .action("LOGOUT")
            .entityType("AUTH")
            .ipAddress(httpRequest.getRemoteAddr())
            .build());
    }
}
