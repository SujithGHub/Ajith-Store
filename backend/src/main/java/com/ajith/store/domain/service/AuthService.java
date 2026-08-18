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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserMapper userMapper;

    @Transactional
    public TokenResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();

        User user = userRepository.findByUsername(request.getUsername()).orElse(null);

        if (user != null && user.getLocked()) {
            if (user.getLockedUntil() != null && user.getLockedUntil().isBefore(LocalDateTime.now())) {
                user.setLocked(false);
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
                userRepository.save(user);
            } else {
                auditLogRepository.save(AuditLog.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .action("LOGIN_FAILED_LOCKED")
                    .entityType("AUTH")
                    .ipAddress(ipAddress)
                    .details("Account is locked. Attempt from IP: " + ipAddress)
                    .build());
                throw new LockedException("Account is locked due to too many failed attempts. Try again later.");
            }
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (DisabledException e) {
            throw new DisabledException("Account is disabled. Contact administrator.");
        } catch (LockedException e) {
            throw e;
        } catch (BadCredentialsException e) {
            if (user != null) {
                int attempts = user.getFailedLoginAttempts() + 1;
                user.setFailedLoginAttempts(attempts);
                if (attempts >= MAX_FAILED_ATTEMPTS) {
                    user.setLocked(true);
                    user.setLockedUntil(LocalDateTime.now().plusMinutes(30));
                    userRepository.save(user);
                    auditLogRepository.save(AuditLog.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .action("ACCOUNT_LOCKED")
                        .entityType("AUTH")
                        .entityId(user.getId())
                        .ipAddress(ipAddress)
                        .details("Account locked after " + attempts + " failed login attempts")
                        .build());
                } else {
                    userRepository.save(user);
                }
                auditLogRepository.save(AuditLog.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .action("LOGIN_FAILED")
                    .entityType("AUTH")
                    .ipAddress(ipAddress)
                    .details("Failed login attempt " + attempts + "/" + MAX_FAILED_ATTEMPTS + " from IP: " + ipAddress)
                    .build());
            }
            throw new BadCredentialsException("Invalid username or password");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(ipAddress);
        user.setFailedLoginAttempts(0);
        if (user.getLocked()) {
            user.setLocked(false);
            user.setLockedUntil(null);
        }
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
            .userId(user.getId())
            .username(user.getUsername())
            .action("LOGIN")
            .entityType("AUTH")
            .ipAddress(ipAddress)
            .build());

        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(principal);

        return new TokenResponse(accessToken, refreshToken, jwtTokenProvider.getAccessTokenExpiration(),
            userMapper.toDto(user));
    }

    @Transactional
    public TokenResponse refresh(RefreshTokenRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        if (!jwtTokenProvider.isRefreshToken(request.getRefreshToken())) {
            throw new RuntimeException("Invalid token type for refresh");
        }

        String username = jwtTokenProvider.getUsernameFromToken(request.getRefreshToken());
        UserPrincipal principal = (UserPrincipal) userDetailsService.loadUserByUsername(username);

        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(principal);

        User user = userRepository.findByUsername(username).orElseThrow();
        auditLogRepository.save(AuditLog.builder()
            .userId(user.getId())
            .username(user.getUsername())
            .action("TOKEN_REFRESH")
            .entityType("AUTH")
            .build());

        return new TokenResponse(accessToken, refreshToken, jwtTokenProvider.getAccessTokenExpiration(),
            userMapper.toDto(user));
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
