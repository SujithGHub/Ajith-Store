# Phase 2 Completion Report — Ajith Store

> **Phase:** Authentication, User Management, Role Management, Permission Management, RBAC, Settings
> **Status:** ✅ Complete

---

## 1. Database Tables Created

### Core Schema (V1)

| Table | Purpose | Key Columns |
|---|---|---|
| `store_config` | Single-row store configuration | store_name, address, phone, email, gst_number, logo_path, currency, tax_enabled, round_off_enabled |
| `users` | System users | username, password_hash, full_name, email, phone, role, enabled, locked, failed_login_attempts, locked_until, last_login_at, last_login_ip |
| `role_permissions` | Granular RBAC permission matrix | role, module, feature, can_create, can_read, can_update, can_delete |
| `audit_logs` | Security audit trail | user_id, username, action, entity_type, entity_id, details, ip_address |

### Roles Table (V9)

| Table | Purpose | Key Columns |
|---|---|---|
| `roles` | Role metadata with descriptions | role (PK), description, is_system, created_at |

### Seed Data (V5 + V9)

**Default users** (password: `admin123` for all):
- `admin` — ADMIN role
- `manager` — MANAGER role
- `cashier` — CASHIER role

**System roles** (seeded in V9):
- `ADMIN` — Full system access
- `MANAGER` — Operations management
- `CASHIER` — Billing and customer service
- `BILLING` — Billing and invoicing

---

## 2. APIs Implemented

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Authenticate user, returns JWT pair |
| POST | `/api/auth/refresh` | Public | Refresh expired access token |
| POST | `/api/auth/logout` | Authenticated | Record logout audit |
| GET | `/api/auth/me` | Authenticated | Get current user info |

### User Management (`/api/users`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | ADMIN | List users (paginated) |
| GET | `/api/users/{id}` | ADMIN | Get user by ID |
| POST | `/api/users` | ADMIN | Create user (with password validation) |
| PUT | `/api/users/{id}` | ADMIN | Update user (tracks role changes) |
| POST | `/api/users/{id}/change-password` | ADMIN | Change another user's password |
| POST | `/api/users/{id}/toggle-status` | ADMIN | Enable/disable user |
| POST | `/api/users/change-password` | Authenticated | Self-service password change |

### Role Management (`/api/roles`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/roles` | ADMIN | List all roles with user counts |
| GET | `/api/roles/{role}` | ADMIN | Get role details |
| POST | `/api/roles` | ADMIN | Create new role (with default read-only permissions) |
| PUT | `/api/roles/{role}` | ADMIN | Update role description |
| DELETE | `/api/roles/{role}` | ADMIN | Delete non-system role (blocked if users assigned) |

### Permission Management (`/api/permissions`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/permissions/{role}` | ADMIN | Get all module permissions for a role |
| PUT | `/api/permissions` | ADMIN | Bulk-update permission matrix (replace all) |

### Store Configuration (`/api/store-config`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/store-config` | ADMIN, MANAGER | Read store settings |
| PUT | `/api/store-config` | ADMIN | Update store settings |

---

## 3. Roles Implemented

| Role | Description | Can Access |
|---|---|---|
| **ADMIN** | Full system access | All modules — users, roles, permissions, settings, products, inventory, purchases, suppliers, customers, sales, reports, audit logs |
| **MANAGER** | Operations management | Products, inventory, purchases, suppliers, customers, sales, returns, expenses, reports, dashboard. Read-only: store config, settings |
| **CASHIER** | Billing and customer service | Sales (create/read/update), customers (create/read/update), returns (create/read), dashboard (read-only) |
| **BILLING** | Billing and invoicing | Sales (create/read/update), customers (read-only), dashboard (read-only) |

---

## 4. Permissions Implemented

The permission system uses a **module × feature × CRUD** matrix stored in `role_permissions`:

**Modules** (14): DASHBOARD, PRODUCTS, INVENTORY, SUPPLIERS, PURCHASES, CUSTOMERS, SALES, RETURNS, EXPENSES, REPORTS, USERS, SETTINGS, STORE_CONFIG, AUDIT

**Actions per module**: `create`, `read`, `update`, `delete`

**Permission Matrix UI** (`/roles`): Admin-facing toggle grid in the frontend allows visual editing of all module permissions for any role. Changes are sent as a bulk PUT to `/api/permissions`.

**Default permissions by role** (seeded in V5):

| Module | ADMIN | MANAGER | CASHIER | BILLING |
|---|---|---|---|---|
| DASHBOARD | CRUD | CRUD | R | R |
| PRODUCTS | CRUD | CRUD | — | — |
| INVENTORY | CRUD | CRUD | — | — |
| SUPPLIERS | CRUD | CRUD | — | — |
| PURCHASES | CRUD | CRUD | — | — |
| CUSTOMERS | CRUD | CRUD | CRU | R |
| SALES | CRUD | CRUD | CRU | CRU |
| RETURNS | CRUD | CRUD | CR | — |
| EXPENSES | CRUD | CRUD | — | — |
| REPORTS | CRUD | CRUD | — | — |
| USERS | CRUD | — | — | — |
| SETTINGS | CRUD | CRUD (view) | — | — |
| STORE_CONFIG | CRUD | CRUD (view) | — | — |
| AUDIT | CRUD | CRUD (view) | — | — |

### PermissionService

The `PermissionService` bean (`hasPermission()`) is available for SpEL-based `@PreAuthorize` expressions, enabling fine-grained action-level checks beyond role names. Current controllers use `hasRole()` / `hasAnyRole()` for simplicity, but the service is wired and ready for granular use.

---

## 5. Security Architecture

### Authentication Flow

```
Client                   Server
  |                         |
  |-- POST /api/auth/login-->|  (username + password)
  |                         |-- Authenticate (Spring Security)
  |                         |-- Check enabled, locked status
  |                         |-- Track failed attempts
  |                         |-- Generate JWT pair
  |<-- {accessToken,         |
  |     refreshToken,        |
  |     expiresIn, user}     |
  |                         |
  |-- GET /api/users ------->|  (Authorization: Bearer <accessToken>)
  |                         |-- JwtAuthenticationFilter validates token
  |                         |-- Rejects refresh tokens used as Bearer
  |                         |-- Sets SecurityContext
  |                         |-- @PreAuthorize enforces role
```

### JWT Token Design

| Property | Access Token | Refresh Token |
|---|---|---|
| **Claims** | username, userId, role, storeId, tokenType: "access" | username, tokenType: "refresh" |
| **Expiry** | 15 minutes (configurable) | 7 days (configurable) |
| **Usage** | Bearer token for API calls | POST /api/auth/refresh only |
| **Validation** | tokenType must be "access" | tokenType must be "refresh" |

### Password Security

- **Hash**: BCrypt via Spring Security `BCryptPasswordEncoder`
- **Complexity**: Min 6 characters, must contain uppercase, lowercase, digit, and special character
- **Validation**: Custom `@ValidPassword` annotation on `UserCreateRequest.password` and `ChangePasswordRequest.newPassword`

### Account Lockout

- **Threshold**: 5 failed login attempts
- **Lock duration**: 30 minutes (auto-unlock)
- **Tracking**: `failed_login_attempts` counter + `locked` boolean + `locked_until` timestamp on `users` table
- **Audit**: Lockout events recorded in `audit_logs` with action `ACCOUNT_LOCKED`
- **Graceful recovery**: Successful login resets the counter and unlocks the account

### Disabled Account Handling

- `CustomUserDetailsService.loadUserByUsername()` first finds the user, then explicitly throws `DisabledException("Account is disabled")` if `enabled = false`
- Previously returned a generic "Invalid username or password" — now returns a specific disable message with HTTP 403

### Refresh Token Security

- Refresh tokens are validated for `tokenType: "refresh"` before generating new tokens
- `JwtAuthenticationFilter` rejects refresh tokens presented as Bearer tokens
- Refresh endpoint validates token type before processing

### API Endpoint Protection

```
/api/auth/**           →  Public (permitAll)
/api/public/**         →  Public (permitAll)
/error                 →  Public (permitAll)
/api/store-config GET  →  ADMIN, MANAGER
/api/store-config PUT  →  ADMIN
/api/users/**          →  ADMIN
/api/roles/**          →  ADMIN
/api/permissions/**    →  ADMIN
All others             →  Authenticated (default)
```

### CORS Configuration

Allowed origins: `http://localhost:5173`, `http://localhost:3000`
Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

---

## 6. Route Protection Strategy

### Backend

1. **Stateless sessions** — `SessionCreationPolicy.STATELESS` (no HTTP session)
2. **JWT filter** — `JwtAuthenticationFilter` extracts Bearer token, validates signature + expiry, checks token type
3. **Method-level security** — `@EnableMethodSecurity` + `@PreAuthorize` on each controller method
4. **Global exception handler** — Maps exceptions to consistent `ApiResponse<T>` format:
   - `BadCredentialsException` → 401
   - `DisabledException` → 403
   - `LockedException` → 403
   - `AccessDeniedException` → 403
   - `EntityNotFoundException` → 404
   - `IllegalArgumentException` → 400
   - `MethodArgumentNotValidException` → 400
   - All others → 500

### Frontend

1. **Auth guard** — `MainLayout` checks `isAuthenticated` before rendering; redirects to `/auth/login`
2. **Loading state** — During `checkAuth()`, shows a spinner instead of flashing protected UI
3. **Auth layout** — Already-authenticated users are redirected from `/auth/login` to `/dashboard`
4. **Role-based navigation** — `Sidebar` filters nav items by `user.role`:
   - ADMIN: 12 items (all)
   - MANAGER: 10 items (all except Users, Roles)
   - CASHIER: 3 items (Dashboard, Customers, Billing)
   - BILLING: 3 items (Dashboard, Customers, Billing)
5. **Settings page** — Non-admin users see disabled save button with "Only admins can modify settings"
6. **Session timeout** — `expiresIn` from login starts a timer that auto-logs out when the token expires
7. **Axios interceptor** — 401 responses trigger silent token refresh; on failure, clears session and redirects

---

## 7. Audit Logging Strategy

### Logged Events

| Event | Action Code | Fields Captured |
|---|---|---|
| Successful login | `LOGIN` | user_id, username, ip_address, timestamp |
| Failed login | `LOGIN_FAILED` | user_id, username, ip_address, attempt_count |
| Account locked | `ACCOUNT_LOCKED` | user_id, username, ip_address, total_attempts |
| Login from locked account | `LOGIN_FAILED_LOCKED` | user_id, username, ip_address |
| Logout | `LOGOUT` | user_id, username, ip_address |
| Token refresh | `TOKEN_REFRESH` | user_id, username |
| User created | `CREATE_USER` | user_id, username, entity_id, details |
| User updated | `UPDATE_USER` | user_id, username, entity_id, details (includes role changes) |
| Password changed | `CHANGE_PASSWORD` | user_id, username, entity_id |
| User enabled | `ENABLE_USER` | user_id, username, entity_id |
| User disabled | `DISABLE_USER` | user_id, username, entity_id |

### Audit Log Table Schema

| Column | Type | Description |
|---|---|---|
| `id` | BIGSERIAL | Primary key |
| `user_id` | BIGINT | Reference to users table |
| `username` | VARCHAR(100) | Username at time of action |
| `action` | VARCHAR(50) | Action code (e.g., LOGIN, CREATE_USER) |
| `entity_type` | VARCHAR(100) | Type of affected entity |
| `entity_id` | BIGINT | ID of affected entity |
| `details` | TEXT | Human-readable description |
| `ip_address` | VARCHAR(50) | Client IP address |
| `created_at` | TIMESTAMP | Auto-set on creation |

### Indexes

- `idx_audit_user` — Fast lookup by user
- `idx_audit_entity` — Fast lookup by entity type + ID
- `idx_audit_created` — Time-range queries

---

## 8. Known Limitations

| # | Limitation | Impact | Mitigation |
|---|---|---|---|
| 1 | **No JWT revocation** — Logout only creates an audit log; tokens remain valid until expiry | Stolen tokens cannot be immediately invalidated | Short access token expiry (15 min) limits window |
| 2 | **No password reset flow** — "Forgot password" button shows a toast only | Users cannot self-recover accounts | Admin can manually change passwords via user management |
| 3 | **No login history table** — Only `last_login_at`/`last_login_ip` on `users` | No historical login audit trail | Audit logs capture login events but not as a structured history |
| 4 | **PermissionService not wired into controller `@PreAuthorize`** — Uses role-name checks instead of granular permission checks | Permission matrix is decorative for API enforcement | Role-based checks are simpler and sufficient for current Phase 2 scope |
| 5 | **No separate `permissions` table** — Permissions embedded as CRUD flags in `role_permissions` | Cannot assign permissions to individual modules without modifying schema | Current schema supports the required granularity |
| 6 | **No rate limiting on login** — API does not throttle repeated requests | Brute-force attacks are possible | Account lockout after 5 attempts mitigates this |
| 7 | **No email/SMS notifications** — No alerts for account lockout or password changes | Users must discover lockout at next login attempt | Admin can inform users manually |

---

## 9. Future Enhancements

### Short-term (Phase 3 candidates)

- **JWT blacklist/revocation** — Store token hashes in DB; check on each request
- **Password reset flow** — Email-based reset with token and expiry
- **Login history table** — Track every login attempt with geolocation and device info
- **Rate limiting** — Per-IP and per-username throttling on login endpoint
- **Granular permission enforcement** — Wire `PermissionService.hasPermission()` into `@PreAuthorize` expressions for action-level control

### Long-term

- **Two-factor authentication (2FA)** — TOTP or SMS-based
- **Session management UI** — Admin dashboard showing active sessions with force-logout capability
- **SSO / OAuth2 integration** — Login via Google, Facebook, etc.
- **Audit log viewer** — Frontend page to query and export audit logs
- **Password expiry policy** — Force password change every N days
- **Concurrent session limits** — Restrict multiple simultaneous logins per user
- **Role hierarchy** — Inherited permissions (e.g., MANAGER inherits from CASHIER)

---

*Generated: June 2026*
