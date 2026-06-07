package com.ajith.store.application.security;

import com.ajith.store.domain.model.User;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@EqualsAndHashCode
public class UserPrincipal implements UserDetails {
    private final Long id;
    private final Long storeId;
    private final String username;
    private final String password;
    private final String fullName;
    private final String role;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, Long storeId, String username, String password,
                         String fullName, String role, boolean enabled,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.storeId = storeId;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.enabled = enabled;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
        return new UserPrincipal(
            user.getId(),
            user.getStoreId(),
            user.getUsername(),
            user.getPasswordHash(),
            user.getFullName(),
            user.getRole(),
            user.getEnabled(),
            authorities
        );
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return enabled; }
}
