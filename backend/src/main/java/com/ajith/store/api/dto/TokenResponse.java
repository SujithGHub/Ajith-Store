package com.ajith.store.api.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserDto user;

    public TokenResponse(String accessToken, String refreshToken, long expiresIn, UserDto user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.user = user;
    }
}
