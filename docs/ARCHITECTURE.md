# Ajith Store — Architecture Document

## 1. System Overview

Ajith Store is a single-store clothing retail management system designed for
multi-user concurrent access within a local network. It follows a modern
client-server architecture with a RESTful API backend and a single-page
application frontend.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                Browser / Tablet                  │
│  ┌───────────────────────────────────────────┐   │
│  │        React SPA (Vite + TypeScript)      │   │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │ Shadcn  │ │ TanStack │ │  Axios    │  │   │
│  │  │ UI      │ │ Query    │ │  HTTP     │  │   │
│  │  └─────────┘ └──────────┘ └───────────┘  │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS / HTTP
                       ▼
┌─────────────────────────────────────────────────┐
│           Spring Boot 3 Backend (Java 21)        │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │  JWT     │ │ Spring   │ │  REST API      │   │
│  │  Filter  │ │ Security │ │  Controllers   │   │
│  └──────────┘ └──────────┘ └────────────────┘   │
│  ┌────────────────────────────────────────────┐  │
│  │       Service Layer (Business Logic)       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │ Product  │ │ Sale     │ │ Purchase │   │  │
│  │  │ Service  │ │ Service  │ │ Service  │   │  │
│  │  ├──────────┤ ├──────────┤ ├──────────┤   │  │
│  │  │ Inventory│ │ Customer │ │ Supplier │   │  │
│  │  │ Service  │ │ Service  │ │ Service  │   │  │
│  │  ├──────────┤ ├──────────┤ ├──────────┤   │  │
│  │  │ Report   │ │ Auth     │ │ Notif    │   │  │
│  │  │ Service  │ │ Service  │ │ Service  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘   │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │    Repository Layer (Spring Data JPA)       │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  Flyway Migrations  │  PostgreSQL (JDBC)   │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │ TCP :5432
                       ▼
┌─────────────────────────────────────────────────┐
│              PostgreSQL 16 Database              │
│  ┌─────────────────┐ ┌──────────────────────┐   │
│  │  48 Tables      │ │  Indexes, Sequences  │   │
│  │  + Flyway       │ │  Functions, Triggers │   │
│  └─────────────────┘ └──────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Backend          | Java 21, Spring Boot 3.3            |
| Build Tool       | Gradle 8.x                          |
| Database         | PostgreSQL 16                       |
| ORM              | Hibernate 6 / Spring Data JPA       |
| Migrations       | Flyway 10                           |
| Security         | Spring Security + JWT (jjwt)        |
| Frontend         | React 18, TypeScript, Vite 5       |
| UI Library       | Shadcn UI (Radix primitives)        |
| State/Data       | TanStack Query v5 + Zustand         |
| Table            | TanStack Table                      |
| Animations       | Framer Motion                       |
| Styling          | Tailwind CSS v3                     |
| Validation       | Zod + React Hook Form               |
| HTTP Client      | Axios                               |
| Charts           | Recharts                            |
| PDF Generation   | iText 7                             |
| Excel Export     | Apache POI                          |
| Barcode          | ZXing (generation + scanner input)  |
| Containerization | Docker + Docker Compose             |

---

## 4. Backend Architecture (Package Structure)

```
com.ajith.store
├── AjithStoreApplication.java
├── application
│   ├── config          → App configs, CORS, internationalization
│   ├── security        → JWT filter, Security chain, Auth entry point
│   └── common          → Exceptions, response wrappers, pagination
├── domain
│   ├── model           → JPA entities (all 30+ entities)
│   ├── repository      → Spring Data JPA repositories
│   └── service         → Business logic layer
│       ├── AuthService.java
│       ├── UserService.java
│       ├── ProductService.java
│       ├── InventoryService.java
│       ├── SupplierService.java
│       ├── PurchaseService.java
│       ├── CustomerService.java
│       ├── SaleService.java
│       ├── PaymentService.java
│       ├── ExpenseService.java
│       ├── ReportService.java
│       ├── DashboardService.java
│       ├── NotificationService.java
│       ├── LoyaltyService.java
│       ├── DayClosingService.java
│       └── SalespersonService.java
├── api
│   ├── controller      → REST controllers (one per module)
│   ├── dto             → Request/Response DTOs
│   └── mapper          → Entity ↔ DTO (MapStruct or manual)
└── infrastructure
    ├── flyway          → V1–V7 migration scripts
    ├── reporting       → PDF (iText) + Excel (POI) generators
    └── barcode         → ZXing barcode generation utility
```

---

## 5. Frontend Architecture (Folder Structure)

```
src/
├── components/
│   ├── ui/             → Shadcn UI components (button, card, table, etc.)
│   └── shared/         → PageHeader, KpiCard, DataTable, EmptyState, PageTransition
├── features/
│   ├── auth/           → Login page, auth guard
│   ├── dashboard/      → KPI cards, revenue chart, top products, notifications
│   ├── products/       → Product master, variants, categories, brands, colors, sizes,
│   │                     fabrics, patterns, tax groups, product images, barcode labels
│   ├── inventory/      → Stock ledger, adjustments, stock alerts
│   ├── suppliers/      → Supplier master, supplier ledger
│   ├── purchases/      → Purchase orders, GRN, purchase invoices, purchase returns
│   ├── customers/      → Customer master, customer ledger, loyalty
│   ├── sales/          → POS billing, draft/hold bills, sales returns, salesperson
│   ├── expenses/       → Expense entry, expense categories
│   ├── day-closing/    → Daily cash closing, reconciliation
│   ├── reports/        → Sales, purchase, inventory, customer, supplier, financial, GST
│   ├── settings/       → Store config, users, roles, permissions, tax groups
│   └── notifications/  → In-app notification center
├── hooks/              → Custom React hooks
├── lib/                → Axios client with JWT interceptor
├── layouts/            → MainLayout (sidebar+header), AuthLayout
├── store/              → Zustand stores (auth)
├── types/              → TypeScript interfaces
└── utils/              → cn(), formatCurrency(), formatDate()
```

---

## 6. Database Modules (48 tables)

| # | Module | Tables | Purpose |
|---|--------|--------|---------|
| 1 | **Core** | store_config, users, role_permissions, audit_logs | Foundation, auth, RBAC |
| 2 | **Product Masters** | categories, brands, manufacturers, colors, sizes, fabrics, patterns, tax_groups | Lookup/reference data |
| 3 | **Products** | products, product_variants, product_images | Product catalog at variant level |
| 4 | **Pricing** | price_change_history | Audit all price changes |
| 5 | **Inventory** | stock_ledger, stock_adjustments, stock_adjustment_items | Stock tracking + adjustments |
| 6 | **Suppliers** | suppliers, supplier_transactions | Supplier master + ledger |
| 7 | **Purchases** | purchase_orders, purchase_order_items, goods_receipt_notes, grn_items, purchase_invoices, purchase_returns, purchase_return_items | PO → GRN → Invoice → Return |
| 8 | **Customers** | customers, customer_transactions, loyalty_transactions | Customer master + ledger + loyalty |
| 9 | **Sales** | sales, sale_items, payments, sales_returns, sales_return_items, draft_sales, draft_sale_items | Billing, split payments, returns, hold bills |
| 10 | **Salespersons** | salespersons | Employee tracking + commission |
| 11 | **Financial** | expenses, expense_categories, day_closing | Expenses + daily closing |
| 12 | **Promotions** | coupons, loyalty_settings | Discounts + loyalty config |
| 13 | **Notifications** | notifications | In-app alerts |
| 14 | **Sequences** | 9 sequences | Auto-numbering for invoices, orders, etc. |
| 15 | **Flyway** | flyway_schema_history | Migration tracking |

---

## 7. Security Architecture

- **JWT tokens** — Access token (15 min) + Refresh token (7 days)
- **Password hashing** — BCrypt
- **RBAC** — 4 roles (ADMIN, MANAGER, CASHIER, BILLING) with module+feature level permissions
- **Stateless** — No HTTP sessions, every request authenticated via JWT
- **CORS** — Restricted to frontend origin
- **API validation** — `@Valid` annotations on all DTOs
- **Rate limiting** — Configurable per endpoint group

---

## 8. API Design

```
Base URL: /api/v1

AUTH                  PRODUCTS              INVENTORY
├── POST /auth/login  ├── GET  /products    ├── GET  /inventory/stock-ledger
├── POST /auth/refresh├── POST /products    ├── POST /inventory/adjustments
├── POST /auth/logout ├── GET  /products/:id├── GET  /inventory/low-stock
├── GET  /auth/me     ├── PUT  /products/:id├── POST /inventory/barcode/print
                      ├── DELETE/products/:id
USERS                 ├── GET  /products/:id/variants    SUPPLIERS
├── GET  /users       ├── POST /variants    ├── GET  /suppliers
├── POST /users       ├── PUT  /variants/:id├── POST /suppliers
├── PUT  /users/:id   ├── POST /variants/barcode├── GET  /suppliers/:id
├── PATCH /users/:id  ├── GET  /categories  ├── GET  /suppliers/:id/ledger
├── POST /users/:id/reset-password│BRANDS,COLORS,SIZES,
                      │FABRICS,PATTERNS,   PURCHASES
CATEGORIES            │TAX_GROUPS          ├── GET  /purchases/orders
├── GET  /categories  ├── GET  /brands      ├── POST /purchases/orders
├── POST /categories  ├── POST /brands      ├── POST /purchases/grn
├── PUT  /categories  ├── PUT  /brands      ├── POST /purchases/invoices
                      ├── (same pattern for ├── POST /purchases/returns
STORE CONFIG          │  colors, sizes,
├── GET  /settings    │  fabrics, patterns, CUSTOMERS
├── PUT  /settings    │  tax_groups)        ├── GET  /customers
├── POST /settings/logo│                   ├── POST /customers
                      ├── GET  /expense-categories├── GET  /customers/:id/ledger
EXPENSES              ├── POST /expense-categories├── POST /customers/:id/loyalty
├── GET  /expenses                           │
├── POST /expenses    SALES & BILLING       SALESPERSONS
├── GET  /expenses/categories├── POST /sales/billing├── GET  /salespersons
                      ├── GET  /sales       ├── POST /salespersons
DASHBOARD             ├── GET  /sales/:id   ├── GET  /salespersons/:id/sales
├── GET  /dashboard   ├── POST /sales/returns
├── GET  /dashboard/top-products├── POST /sales/draft     DAY CLOSING
├── GET  /dashboard/alerts├── PUT  /sales/draft/:id├── POST /day-closing
                      ├── DELETE/sales/draft/:id├── GET  /day-closing
REPORTS               ├── GET  /sales/draft ├── GET  /day-closing/latest
├── GET  /reports/sales/daily                ├── PUT  /day-closing/:id
├── GET  /reports/sales/monthly   NOTIFICATIONS
├── GET  /reports/sales/yearly    ├── GET  /notifications
├── GET  /reports/sales/product   ├── PATCH /notifications/:id/read
├── GET  /reports/sales/category  ├── POST /notifications/read-all
├── GET  /reports/sales/employee  
├── GET  /reports/purchases/summary         BACKUP
├── GET  /reports/inventory/stock ├── POST /backup
├── GET  /reports/inventory/dead ├── POST /backup/restore
├── GET  /reports/financial/pnl   ├── GET  /backup/schedule
├── GET  /reports/financial/gst   ├── PUT  /backup/schedule
├── GET  /reports/customer/outstanding
├── GET  /reports/supplier/outstanding
├── (All support ?export=pdf&export=excel)
```

---

## 9. Key Design Decisions

1. **Variant-level inventory** — Stock tracked per SKU (color + size combination), not at product level
2. **Barcode as identifier** — Barcode used as primary lookup for fast POS billing
3. **Mandatory stock ledger** — Every inventory movement (purchase, sale, return, adjustment) creates a stock ledger entry. Variant's `current_stock` is a derived/cached value
4. **Split payments** — Single sale can have multiple payment methods (Cash + UPI + Card)
5. **Draft/Hold billing** — Sales can be drafted/hold and resumed later, useful for retail scenarios
6. **Purchase flow** — Supplier → PO → GRN → Supplier Invoice → Payment (supports partial receipt & partial invoicing)
7. **Optimistic locking** — `version` field on high-concurrency entities (product_variants) prevents lost updates
8. **Tax groups** — Products reference tax groups (5%, 12%, 18%, 28%) instead of storing individual CGST/SGST/IGST values
9. **Salesperson tracking** — Each sale can be attributed to a salesperson for commission and performance reporting
10. **Day closing** — Mandatory end-of-day reconciliation tracks opening cash, sales by payment mode, expenses, and closing cash
11. **Audit-first** — All price changes, stock movements, and user actions are logged with full audit trail
12. **Notification-driven** — Low stock, reorder levels, pending payments trigger in-app notifications

---

## 10. Deployment Architecture

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Frontend     │     │  Backend      │     │  PostgreSQL   │
│  Container    │────▶│  Container    │────▶│  Container    │
│  :5173 (dev)  │     │  :8080        │     │  :5432        │
│  :80 (prod)   │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                      │
        └─────────────────────┴──────────────────────┘
                         Docker Network
```

All services run via Docker Compose on a single host machine, accessible
to all devices on the local network via the host's IP address.

### Backup Strategy

- **Manual** — Admin-triggered via API (`pg_dump`)
- **Scheduled** — Configurable cron via API (daily/weekly)
- **Restore** — Admin-only via API (`pg_restore`)
- Backups stored in `/var/ajith-store/backups/`
