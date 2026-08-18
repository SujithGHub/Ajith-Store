# Ajith Store — Phase Verification Document

> **Purpose:** A living checklist used to verify that each development phase is complete and correct before marking it done.
> **How to use:** Work through each phase's checklist below. Tick every item. A phase is **Complete** only when all its checkboxes are verified. Update the status table at the bottom after each verification round.
> **Owner:** Project maintainer. **Reviewed:** on every phase completion / before deployment.

---

## 0. Prerequisites & Environment

### 0.1 Tooling

- [ ] Docker + Docker Compose installed (`docker --version`)
- [ ] Java 21 (`java -version`)
- [ ] Node.js 18+ (`node --version`)
- [ ] PostgreSQL client `psql` available for DB inspection

### 0.2 Starting the stack

```bash
# Start only the database (dev workflow)
docker compose up -d db

# Full stack (backend + frontend + db)
docker compose up --build

# Backend dev (from ./backend)
./gradlew bootRun

# Frontend dev (from ./frontend)
npm install && npm run dev
```

- [ ] Backend reachable at `http://localhost:8080`
- [ ] Frontend reachable at `http://localhost:5173` (dev) or `http://localhost` (prod)
- [ ] DB accessible at `localhost:5432`, db/user/pass: `ajith_store` / `ajith_user` / `ajith_pass`

### 0.3 Default seed accounts

All default passwords are `admin123`.

| Username  | Role      |
|-----------|-----------|
| `admin`   | ADMIN     |
| `manager` | MANAGER   |
| `cashier` | CASHIER   |

### 0.4 API response envelope

All API responses use the `ApiResponse<T>` wrapper:

```json
{ "success": true, "message": "...", "data": { ... }, "error": null }
```

Verification scripts below read `data` from this envelope.

---

## 1. Phase 1 — Architecture, Database Schema & Foundations

**Status:** Complete (committed)

### 1.1 Repository structure

- [ ] Backend follows layered structure: `api/controller`, `api/dto`, `application/config`, `application/security`, `domain/model`, `domain/repository`, `domain/service`, `resources/db/migration`
- [ ] Frontend follows feature folders under `src/features/{module}/`
- [ ] `docs/ARCHITECTURE.md`, `docs/ER_DIAGRAM.md`, `database/SCHEMA.md` exist and match the schema

### 1.2 Database migrations (V1–V7)

- [ ] Flyway migrations exist: `V1` core, `V2` products, `V3` purchases, `V4` sales, `V5` seed, `V6` enhancements, `V7` salesperson
- [ ] `flyway_schema_history` contains all applied versions after first boot

### 1.3 Table inventory

Run:

```sql
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
```

- [ ] 48 business tables present (excluding `flyway_schema_history`)
- [ ] Core tables: `store_config`, `users`, `role_permissions`, `audit_logs`
- [ ] Product tables: `categories`, `brands`, `manufacturers`, `colors`, `sizes`, `fabrics`, `patterns`, `tax_groups`, `products`, `product_variants`, `product_images`, `price_change_history`
- [ ] Inventory tables: `stock_ledger`, `stock_adjustments`, `stock_adjustment_items`
- [ ] Purchase tables: `suppliers`, `supplier_transactions`, `purchase_orders`, `purchase_order_items`, `goods_receipt_notes`, `grn_items`, `purchase_invoices`, `purchase_returns`, `purchase_return_items`
- [ ] Sales tables: `customers`, `customer_transactions`, `sales`, `sale_items`, `payments`, `sales_returns`, `sales_return_items`, `draft_sales`, `draft_sale_items`, `salespersons`
- [ ] Financial tables: `expenses`, `expense_categories`, `day_closing`
- [ ] Promotions / notifications: `coupons`, `loyalty_settings`, `loyalty_transactions`, `notifications`

### 1.4 Sequences

- [ ] 9 sequences exist (`seq_invoice_no`, `seq_purchase_order_no`, `seq_grn_no`, `seq_purchase_invoice_no`, `seq_return_no`, `seq_expense_no`, `seq_adjustment_no`, `seq_customer_code`, `seq_draft_no`)
- [ ] Invoice sequence starts at 1001

### 1.5 Key constraints & relationships

- [ ] `product_variants.barcode` and `sku` are UNIQUE
- [ ] `product_variants` has a `version` column (optimistic locking)
- [ ] `stock_ledger` exists and every inventory movement must write a row (validated functionally in Phase 4+)
- [ ] `sales` → `payments` is 1:N (split payments)
- [ ] `categories.parent_id` self-reference present (subcategories)

### 1.6 Seed data

- [ ] `store_config` has exactly 1 row (default store)
- [ ] Users `admin`, `manager`, `cashier` exist with BCrypt-hashed `admin123`
- [ ] Categories seeded (Men / Women / Kids tree with subcategories)

---

## 2. Phase 2 — Auth, Users, Roles, Permissions, RBAC, Settings

**Status:** Complete (committed; some refinements pending commit)

### 2.1 Authentication API — `/api/auth`

| Endpoint | Test |
|---|---|
| `POST /api/auth/login` | Login with `admin`/`admin123` → HTTP 200, returns `accessToken`, `refreshToken`, `expiresIn`, `user` |
| `POST /api/auth/refresh` | Use a valid refresh token → HTTP 200, new token pair issued |
| `POST /api/auth/refresh` | Use an access token as refresh → HTTP 4xx rejected |
| `GET /api/auth/me` | With valid Bearer token → returns current user profile |
| `POST /api/auth/logout` | Authenticated → 200, audit record `LOGOUT` written |

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')
curl -s http://localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"
```

- [ ] All five endpoints verified above

### 2.2 Login security

- [ ] Invalid credentials → HTTP 401 `Invalid username or password`
- [ ] Disabled account → HTTP 403 with message `Account is disabled. Contact administrator.`
- [ ] Locked account → HTTP 403 with lockout message

### 2.3 Account lockout (V8)

- [ ] `users` table has columns `failed_login_attempts`, `locked`, `locked_until`
- [ ] 5 consecutive wrong passwords for a valid username → account locked for 30 minutes
- [ ] Lockout event recorded in `audit_logs` with action `ACCOUNT_LOCKED`
- [ ] After lock expiry, next login resets counter and unlocks
- [ ] Successful login resets `failed_login_attempts` to 0

### 2.4 User management — `/api/users`

- [ ] `GET /api/users` (ADMIN) returns paginated list
- [ ] `GET /api/users/{id}` returns single user
- [ ] `POST /api/users` creates user; weak password (no uppercase/digit/special) → HTTP 400 validation error
- [ ] `PUT /api/users/{id}` updates user; role change is tracked in audit log
- [ ] `POST /api/users/{id}/change-password` (ADMIN) resets another user's password
- [ ] `POST /api/users/{id}/toggle-status` enables/disables user
- [ ] `POST /api/users/change-password` (self-service) works for own password

### 2.5 Role management — `/api/roles`

- [ ] `GET /api/roles` lists roles with user counts
- [ ] `POST /api/roles` creates a new role with default read-only permissions
- [ ] `PUT /api/roles/{role}` updates description
- [ ] `DELETE /api/roles/{role}` blocks deletion of system roles and roles that have users
- [ ] System roles `ADMIN`, `MANAGER`, `CASHIER`, `BILLING` seeded (V9)

### 2.6 Permission management — `/api/permissions`

- [ ] `GET /api/permissions/{role}` returns the module × CRUD matrix for a role
- [ ] `PUT /api/permissions` bulk-updates the matrix
- [ ] Default matrix matches spec (ADMIN=all CRUD; CASHIER sales CRU, customers CRU, dashboard R, etc.)
- [ ] Permission matrix edits persist and are visible on reload

### 2.7 RBAC enforcement (backend)

- [ ] Non-ADMIN cannot access `/api/users`, `/api/roles`, `/api/permissions` (403)
- [ ] MANAGER can `GET /api/store-config` but cannot `PUT` it (403)
- [ ] Cashier/Billing cannot access product or inventory endpoints (403)
- [ ] Unauthenticated request to a protected endpoint → 401
- [ ] `JwtAuthenticationFilter` rejects a refresh token used as a Bearer token

### 2.8 RBAC enforcement (frontend)

- [ ] Login redirects to `/dashboard`; visiting `/auth/login` while authenticated redirects away
- [ ] Logging out clears session and returns to login
- [ ] Sidebar filters menu items by role:
  - ADMIN → 12 items (all)
  - MANAGER → 10 items (no Users, no Roles)
  - CASHIER / BILLING → 3 items (Dashboard, Customers, Billing)
- [ ] Settings page: non-admin sees save disabled with "Only admins can modify settings"
- [ ] Access-token expiry triggers silent refresh via axios interceptor; on refresh failure, session cleared → redirect to login

### 2.9 Store configuration — `/api/store-config`

- [ ] `GET` returns store config (store name, address, GST, currency, logo, tax/round-off flags)
- [ ] `PUT` (ADMIN) updates and persists config
- [ ] Store name changes reflect in dashboard/header after refresh

### 2.10 Audit logging

Verify in `audit_logs` table:

- [ ] `LOGIN`, `LOGIN_FAILED`, `ACCOUNT_LOCKED`, `LOGOUT`, `TOKEN_REFRESH` on auth events
- [ ] `CREATE_USER`, `UPDATE_USER`, `CHANGE_PASSWORD`, `ENABLE_USER`, `DISABLE_USER` on user events
- [ ] Audit rows capture `user_id`, `username`, `action`, `entity_type`, `ip_address`

### 2.11 Phase 2 known gaps (not blocking, tracked)

- [ ] Documented in `PHASE_2_COMPLETION_REPORT.md` §8–9:
  - No JWT revocation / blacklist
  - No self-service password reset (forgot-password is toast only)
  - No login history table
  - `PermissionService.hasPermission()` not yet wired into `@PreAuthorize` (role checks used instead)
  - No audit log viewer UI

---

## 3. Phase 3 — Products, Masters & Inventory (in progress)

**Status:** In progress — backend controllers/DTOs/services written but **not yet committed**; frontend built for Products, Masters, Inventory.

### 3.1 Master data APIs (all require ADMIN/MANAGER)

- [ ] `GET/POST/PUT/DELETE /api/categories` (+ `GET /api/categories/root`, `GET /api/categories/{id}/children`)
- [ ] `GET/POST/PUT/PATCH/DELETE /api/brands`
- [ ] `GET/POST/PUT/PATCH/DELETE /api/colors`
- [ ] `GET/POST/PUT/PATCH/DELETE /api/sizes`
- [ ] `GET/POST/PUT/PATCH/DELETE /api/fabrics`
- [ ] `GET/POST/PUT/PATCH/DELETE /api/patterns`
- [ ] `GET/POST/PUT/PATCH/DELETE /api/tax-groups`
- [ ] Manufacturer master (`Manufacturer` model/repo/service/DTO exist; verify controller wiring)

### 3.2 Products

- [ ] `GET /api/products` returns paginated product list with variants
- [ ] `POST /api/products` creates product + variants (generates barcode/SKU)
- [ ] `GET /api/products/{id}` returns full product with variants and images
- [ ] `GET /api/products/barcode/{barcode}` looks up a variant by barcode (used by POS)
- [ ] `PUT /api/products/{id}` updates product and variants
- [ ] `PATCH /api/products/{id}/status` activates/deactivates
- [ ] `DELETE /api/products/{id}` admin-only
- [ ] Price changes on variants create `price_change_history` rows
- [ ] Stock movement (opening stock / adjustment) writes `stock_ledger` rows and updates `current_stock`

### 3.3 Stock adjustments

- [ ] `POST /api/stock-adjustments` creates an adjustment (+ items) and updates variant stock
- [ ] `GET /api/stock-adjustments` lists adjustments
- [ ] Adjustment number auto-generated from sequence

### 3.4 Stock ledger & alerts

- [ ] `GET /api/products/{variantId}/ledger` returns stock ledger for a variant
- [ ] `GET /api/products/alerts/low-stock` returns variants below `min_stock`
- [ ] `GET /api/products/alerts/reorder` returns variants below `reorder_level`
- [ ] Dashboard low-stock alerts populate from these endpoints

### 3.5 Frontend pages

- [ ] Products page: list, create/edit form, variant management, status toggle, image upload
- [ ] Masters page: tabbed CRUD for categories, brands, colors, sizes, fabrics, patterns, tax groups
- [ ] Inventory page: stock ledger view, adjustments, low-stock alerts
- [ ] All wired to real APIs (no hardcoded mock data)

### 3.6 Phase 3 commit status

- [ ] Backend master/product/inventory files are `untracked` (see `git status`) — must be committed before Phase 3 can be marked complete
- [ ] `./gradlew build` passes (backend)
- [ ] `npm run build` passes (frontend)

---

## 4. Phase 4+ — Remaining Modules (NOT STARTED)

**Status:** Not implemented — placeholder pages only.

### 4.1 Placeholder pages (8-line stubs, must be built)

- [ ] Customers — `frontend/src/features/customers/CustomersPage.tsx`
- [ ] Suppliers — `frontend/src/features/suppliers/SuppliersPage.tsx`
- [ ] Purchases — `frontend/src/features/purchases/PurchasesPage.tsx`
- [ ] Reports — `frontend/src/features/reports/ReportsPage.tsx`
- [ ] Sales list — `frontend/src/features/sales/SalesPage.tsx`

### 4.2 Backend modules missing entirely

- [ ] Suppliers (model, repo, service, controller, DTOs)
- [ ] Purchases (PO → GRN → Invoice → Return workflow)
- [ ] Customers + customer ledger + loyalty
- [ ] Sales / billing / split payments / draft sales / returns
- [ ] Salesperson management + commission
- [ ] Expenses + expense categories
- [ ] Day closing
- [ ] Reports (sales/purchase/inventory/financial/GST) + PDF/Excel export
- [ ] Dashboard analytics service
- [ ] Notifications (low stock, pending payments)
- [ ] Backup / restore / schedule
- [ ] Barcode generation/print
- [ ] Audit log viewer UI

---

## 5. Regression & Cross-Cutting Checks (run every phase)

- [ ] Backend builds: `./gradlew build` (from `./backend`)
- [ ] Frontend builds: `npm run build` (from `./frontend`)
- [ ] App boots with `spring.jpa.hibernate.ddl-auto=validate` — no schema mismatch errors
- [ ] Login/logout round trip works for all 3 seeded roles
- [ ] 401 on expired/invalid token, 403 on insufficient role — no 500s
- [ ] No secrets committed (`application.yml` uses env overrides; default JWT secret flagged for prod change)
- [ ] `git status` is clean for committed phases (nothing pending that should already be committed)

---

## 6. Phase Status Summary

| Phase | Scope | Status | Verified By | Date |
|-------|-------|--------|-------------|------|
| 1 | Architecture, DB schema, seed data | ✅ Complete | | |
| 2 | Auth, Users, Roles, Permissions, RBAC, Settings | ✅ Code complete (lockout refinements uncommitted) | | |
| 3 | Products, Masters, Inventory | 🚧 In progress (uncommitted) | | |
| 4 | Suppliers, Purchases, Customers | ❌ Not started | | |
| 5 | Sales, Billing, Returns, Salespersons | ❌ Not started | | |
| 6 | Expenses, Day closing, Reports | ❌ Not started | | |
| 7 | Notifications, Backup, Audit UI | ❌ Not started | | |

---

*Generated: August 2026. Keep in sync with ARCHITECTURE.md, ER_DIAGRAM.md, SCHEMA.md, and PHASE_2_COMPLETION_REPORT.md.*
