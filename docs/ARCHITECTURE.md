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
│                   Browser (Chrome/Edge)          │
│  ┌───────────────────────────────────────────┐   │
│  │        React SPA (Vite + TypeScript)      │   │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │ Shadcn  │ │ React    │ │  Axios    │  │   │
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
│  │         Service Layer (Use Cases)          │  │
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
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │  Master  │ │  Indexes │ │  Functions     │   │
│  │  Tables  │ │          │ │  & Triggers    │   │
│  └──────────┘ └──────────┘ └────────────────┘   │
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
| State/Data       | React Query v5 + Zustand            |
| Styling          | Tailwind CSS v3                     |
| Validation       | Zod + React Hook Form               |
| HTTP Client      | Axios                               |
| PDF Generation   | JasperReports or iText              |
| Excel Export     | Apache POI                          |
| Barcode          | Barcode4J / ZXing                   |
| Containerization | Docker + Docker Compose             |

---

## 4. Backend Architecture (Package Structure)

```
com.ajith.store
├── AjithStoreApplication.java
├── application
│   ├── config          → Application configs
│   ├── security        → JWT, CORS, Security config
│   └── common          → Shared utilities, exceptions
├── domain
│   ├── model           → JPA entities
│   ├── repository      → Spring Data repos
│   └── service         → Business logic
├── api
│   ├── controller      → REST controllers
│   ├── dto             → Request/Response DTOs
│   └── mapper          → Entity ↔ DTO mappers
└── infrastructure
    ├── flyway          → Migration scripts
    └── reporting       → PDF, Excel generators
```

---

## 5. Frontend Architecture (Folder Structure)

```
src/
├── components/         → Shared UI components
├── features/           → Feature modules
│   ├── auth/           → Login, register
│   ├── products/       → Product management
│   ├── inventory/      → Stock management
│   ├── suppliers/      → Supplier management
│   ├── purchases/      → Purchase management
│   ├── customers/      → Customer management
│   ├── sales/          → Billing & sales
│   ├── reports/        → Reports module
│   └── settings/       → Store settings
├── hooks/              → Custom React hooks
├── lib/                → API client, utilities
├── layouts/            → Page layouts
├── pages/              → Route pages
├── store/              → Zustand stores
├── types/              → TypeScript type definitions
└── utils/              → Helper functions
```

---

## 6. Database Design Principles

- All tables use UUID or BIGSERIAL as primary keys
- Auditing columns (created_at, updated_at, created_by) on all tables
- Soft delete where applicable (status column)
- Composite indexes on frequently searched columns
- Foreign keys with proper cascade rules
- Flyway for version-controlled migrations

---

## 7. Security Architecture

- JWT tokens with access (15min) and refresh (7d) tokens
- Passwords hashed with BCrypt
- Role-based access at controller method level
- API rate limiting
- Input validation on all endpoints
- CORS restricted to frontend origin
- Stateless authentication

---

## 8. API Design

```
Base URL: /api/v1

Auth:
  POST   /auth/login
  POST   /auth/refresh
  POST   /auth/logout

Users:
  GET    /users
  POST   /users
  PUT    /users/{id}
  DELETE /users/{id}

Products:
  GET    /products
  POST   /products
  PUT    /products/{id}
  DELETE /products/{id}
  GET    /products/{id}/variants

... (all CRUD resources follow same pattern)
```

---

## 9. Key Design Decisions

1. **Variant-level inventory** — Stock tracked per SKU (color + size combination),
   not at product level
2. **Barcode as identifier** — Barcode used as primary lookup for fast billing
3. **Hexagonal influences** — Domain logic separated from infrastructure concerns
4. **Optimistic locking** — Version field on high-concurrency entities (variants)
5. **Materialized views** — For report queries to avoid complex joins at runtime
6. **Caching** — Redis optional for session/category caching (future enhancement)

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
