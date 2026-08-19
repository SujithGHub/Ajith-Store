# Phase 4 Progress Report — Ajith Store

> **Phase:** Suppliers, Purchases & Customers
> **Start:** August 2026
> **Status:** ✅ Backend complete + frontend complete — pending end-to-end API verification and commit

This document is the **living tracker** for Phase 4. Each item below is marked ✅ when implemented and verified. When the full checklist is complete, a `PHASE_4_COMPLETION_REPORT.md` will be generated (following the Phase 2/3 pattern).

---

## 1. Phase 4 Scope

| Module | Purpose |
|---|---|
| **Suppliers** | Supplier master + supplier ledger (`supplier_transactions`) |
| **Purchases** | Purchase Order → GRN → Purchase Invoice → Purchase Return workflow |
| **Customers** | Customer master + customer ledger (`customer_transactions`) |

---

## 2. Suppliers

**Status:** ✅ Complete

### 2.1 Supplier master

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/api/suppliers` | ADMIN, MANAGER | ✅ |
| GET | `/api/suppliers/active` | ADMIN, MANAGER | ✅ |
| GET | `/api/suppliers/{id}` | ADMIN, MANAGER | ✅ |
| POST | `/api/suppliers` | ADMIN, MANAGER | ✅ |
| PUT | `/api/suppliers/{id}` | ADMIN, MANAGER | ✅ |
| PATCH | `/api/suppliers/{id}/status` | ADMIN, MANAGER | ✅ |
| DELETE | `/api/suppliers/{id}` | ADMIN | ✅ |

### 2.2 Supplier ledger

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/api/suppliers/{id}/transactions` | ADMIN, MANAGER | ✅ |

### 2.3 Supplier fields

- name, contact_person, mobile, email, address, gst_number, credit_terms
- opening_balance, current_balance (ledger-driven), status — all implemented ✅
- Opening balance posts an `OPENING_BALANCE` ledger entry automatically ✅

---

## 3. Customers

**Status:** ✅ Complete

### 3.1 Customer master

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/api/customers` | ADMIN, MANAGER, CASHIER | ✅ |
| GET | `/api/customers/active` | ADMIN, MANAGER, CASHIER | ✅ |
| POST | `/api/customers` | ADMIN, MANAGER, CASHIER | ✅ |
| GET | `/api/customers/{id}` | ADMIN, MANAGER, CASHIER | ✅ |
| PUT | `/api/customers/{id}` | ADMIN, MANAGER, CASHIER | ✅ |
| PATCH | `/api/customers/{id}/status` | ADMIN, MANAGER | ✅ |
| DELETE | `/api/customers/{id}` | ADMIN | ✅ |

### 3.2 Customer ledger

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/api/customers/{id}/transactions` | ADMIN, MANAGER, CASHIER | ✅ |

### 3.3 Customer fields

- customer_code (auto-generated from `seq_customer_code` sequence) ✅
- name, mobile, email, address, gst_number, credit_limit, opening_balance, current_balance ✅
- loyalty_points, membership_level, status ✅
- Opening balance posts an `OPENING_BALANCE` ledger entry automatically ✅

---

## 4. Purchases

**Status:** ✅ Complete

### 4.1 Purchase Orders

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/api/purchase-orders` | ADMIN, MANAGER | ✅ |
| GET | `/api/purchase-orders/available` | ADMIN, MANAGER | ✅ |
| GET | `/api/purchase-orders/{id}` | ADMIN, MANAGER | ✅ |
| POST | `/api/purchase-orders` | ADMIN, MANAGER | ✅ |
| PUT | `/api/purchase-orders/{id}` | ADMIN, MANAGER | ✅ |
| PATCH | `/api/purchase-orders/{id}/status` | ADMIN, MANAGER | ✅ |
| DELETE | `/api/purchase-orders/{id}` | ADMIN | ✅ |

### 4.2 GRN (Goods Receipt Notes)

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/api/grns` | ADMIN, MANAGER | ✅ |
| GET | `/api/grns/{id}` | ADMIN, MANAGER | ✅ |
| GET | `/api/grns/pending-order/{purchaseOrderId}` | ADMIN, MANAGER | ✅ |
| POST | `/api/grns` | ADMIN, MANAGER | ✅ |
| PATCH | `/api/grns/{id}/approve` | ADMIN, MANAGER | ✅ |

### 4.3 Purchase Invoices

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/api/purchase-invoices` | ADMIN, MANAGER | ✅ |
| GET | `/api/purchase-invoices/{id}` | ADMIN, MANAGER | ✅ |
| POST | `/api/purchase-invoices` | ADMIN, MANAGER | ✅ |
| PATCH | `/api/purchase-invoices/{id}/payment` | ADMIN, MANAGER | ✅ |

### 4.4 Purchase Returns

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/api/purchase-returns` | ADMIN, MANAGER | ✅ |
| GET | `/api/purchase-returns/{id}` | ADMIN, MANAGER | ✅ |
| POST | `/api/purchase-returns` | ADMIN, MANAGER | ✅ |

### 4.5 Workflow rules

- [x] PO number auto-generated (`seq_purchase_order_no`, starts 1001) — `PO-<n>`
- [x] GRN references a PO; supports partial receipt (`ordered_qty` vs `received_qty` vs `accepted_qty`/`rejected_qty`)
- [x] GRN approval increments stock via `StockLedgerService.addEntry` (`PURCHASE_GRN`)
- [x] Purchase invoice references PO + supplier; computes totals (subtotal − discount + tax)
- [x] Invoice payment updates `paid_amount`, `balance_amount`, `status` (PARTIAL → PAID), and posts supplier ledger entries
- [x] Purchase return decrements stock (`PURCHASE_RETURN`) and adjusts supplier balance
- [x] Every movement writes a `stock_ledger` row (no exceptions)
- [x] PO tax computed per-line from the variant's product tax group (CGST+SGST+IGST)
- [x] Only DRAFT POs can be updated/deleted

---

## 5. Frontend

| Page | Location | Status |
|---|---|---|
| Suppliers | `features/suppliers/SuppliersPage.tsx` | ✅ CRUD + ledger dialog |
| Customers | `features/customers/CustomersPage.tsx` | ✅ CRUD + ledger dialog |
| Purchases | `features/purchases/PurchasesPage.tsx` | ✅ Tabbed PO / GRN / Invoices / Returns + create dialogs + view dialogs |

---

## 6. Verification

| Check | Status |
|---|---|
| `./gradlew build` passes (backend) | ✅ |
| `npx tsc -b` passes (frontend) | ✅ |
| No schema mismatch (`ddl-auto=validate`) | ⏳ Requires runtime DB check |
| End-to-end API test (login → create supplier → PO → GRN → approve → invoice → payment → return) | ⏳ Pending manual/scripted test |

---

## 7. Phase 4 Checklist Summary

- [x] Suppliers backend complete
- [x] Customers backend complete
- [x] Purchases backend complete (PO → GRN → Invoice → Return)
- [x] Frontend: Suppliers page
- [x] Frontend: Customers page
- [x] Frontend: Purchases page
- [x] Backend + frontend build passes
- [ ] End-to-end API verification via running app
- [ ] Commit Phase 4 work
- [ ] Completion report generated (`PHASE_4_COMPLETION_REPORT.md`)

---

## 8. Runtime Fixes & Refactors (post-build)

> Work done after the last build pass. All changes below are UNCOMMITTED as of the last update.

### 8.1 Environment / port alignment
- [x] `backend/src/main/resources/application.yml` — `server.port: 8081` (uncommitted local change)
- [x] `frontend/vite.config.ts` — dev proxy `/api` target changed `8080 → 8081` (matches running backend)
- [x] Root cause of "can't login": Vite proxied to port 8080 while backend ran on 8081. Backend auth itself verified: `POST /api/auth/login` `admin/admin123` returns a valid token.
- [x] `frontend/.env.example` — trailing-newline tweak only

### 8.2 Doubled `/api/` prefix bug (api/api/... 404)
- [x] Axios client `baseURL: '/api'` means call paths must NOT include `/api`.
- [x] Stripped `/api` prefix from: `SuppliersPage.tsx`, `CustomersPage.tsx`, `PurchasesPage.tsx`, `MastersPage.tsx` (all endpoints in those files)
- [x] `api.ts` refresh call keeps `/api/auth/refresh` (uses raw `axios`, not the prefixed client) — intentional
- [x] Old `NoResourceFoundException: api/api/suppliers` logs = stale bundle; fixed in source

### 8.3 Validation error messages
- [x] `GlobalExceptionHandler.handleValidation` now prefixes **field name** → e.g. `itemCode: Item code is required` (was bare "must not be blank")
- [x] Added meaningful `message=` to every `@NotBlank/@NotNull/@NotEmpty` across all DTOs under `api/dto/` (products, masters, suppliers, customers, purchases, GRN, invoices, returns, stock adjustments, users, auth, store config, permissions)
- [x] Verified: `grep` shows zero bare validation annotations remaining

### 8.4 Product add/edit: dialog → standalone screen
- [x] New page `features/products/ProductFormPage.tsx` — full-screen form (Basic Info + Variants tabs), loads product by id when editing
- [x] `FeaturesPage` (ProductsPage.tsx) reduced to list/table only; Add/Edit now **navigate**
- [x] Routes in `App.tsx`:
  - `/products` — list
  - `/products/new` — create
  - `/products/edit/:id` — edit
- [x] Form navigation: "Back to Products" (header) + Cancel button; keeps MainLayout sidebar

### 8.5 Purchase Order variants data source
- [x] Background: `purchase_order_items.variant_id` is NOT NULL; stock/price is variant-level, so POs correct pick variants (e.g. "Shirt / Red / M"), not generic products
- [x] Bug: PO form built its variant list from `GET /products` (list), whose `ProductListDto` has NO variants → dropdown was empty
- [x] Backend: new `GET /api/products/variants` → flat list of all ACTIVE `VariantDto` (includes `productName`, prices) — `ProductController.getAllActiveVariants()` + `ProductService.getAllActiveVariants()`
- [x] Frontend: `PurchasesPage.tsx` now loads `/products/variants` directly; removed broken product→variant flattening and a shadowed `allVariants` memo
- [x] Removed now-unused `Product` type import from PurchasesPage

### 8.6 Build status after fixes
- [x] `./gradlew compileJava` passes
- [x] `npx tsc -b` passes

---

## 9. Remaining Work (next session)

- [ ] Restart backend (`./gradlew bootRun`) to expose `/api/products/variants`
- [ ] Runtime E2E: login admin/admin123 → create supplier → PO (variants now listed) → GRN → approve → invoice → payment → return
- [ ] Create a product first if no products/variants exist (products page → Add Product → variants tab)
- [ ] Commit Phase 4 work (backend + frontend + Vite proxy + validation + product screen refactor + variants endpoint)
- [ ] Generate `PHASE_4_COMPLETION_REPORT.md`
- [ ] Then Phase 5 (post-Phase-4) — see `PHASE_VERIFICATION.md` for scope

---

*Generated: August 2026. Tracked items marked ✅ when verified.*
