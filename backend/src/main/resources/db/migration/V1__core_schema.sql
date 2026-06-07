-- Ajith Store - Core Schema
-- V1: Store config, users, roles, permissions, audit logs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- STORE CONFIGURATION
-- ============================================================
CREATE TABLE store_config (
    id              BIGSERIAL PRIMARY KEY,
    store_name      VARCHAR(255) NOT NULL DEFAULT 'Ajith Store',
    address         TEXT,
    phone           VARCHAR(50),
    email           VARCHAR(255),
    gst_number      VARCHAR(50),
    logo_path       VARCHAR(500),
    invoice_header  TEXT,
    invoice_footer  TEXT,
    currency        VARCHAR(10) NOT NULL DEFAULT 'INR',
    financial_year_start DATE,
    financial_year_end   DATE,
    tax_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    round_off_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    store_id        BIGINT NOT NULL REFERENCES store_config(id),
    username        VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(50),
    role            VARCHAR(50) NOT NULL DEFAULT 'CASHIER',
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMP,
    last_login_ip   VARCHAR(50),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_store ON users(store_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);

-- ============================================================
-- ROLE PERMISSIONS (RBAC)
-- ============================================================
CREATE TABLE role_permissions (
    id              BIGSERIAL PRIMARY KEY,
    role            VARCHAR(50) NOT NULL,
    module          VARCHAR(100) NOT NULL,
    feature         VARCHAR(100) NOT NULL,
    can_create      BOOLEAN NOT NULL DEFAULT FALSE,
    can_read        BOOLEAN NOT NULL DEFAULT FALSE,
    can_update      BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete      BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (role, module, feature)
);

CREATE INDEX idx_rp_role ON role_permissions(role);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    username        VARCHAR(100),
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       BIGINT,
    details         TEXT,
    ip_address      VARCHAR(50),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- SEQUENCES for invoice/order numbers
-- ============================================================
CREATE SEQUENCE seq_invoice_no START 1001;
CREATE SEQUENCE seq_purchase_order_no START 1001;
CREATE SEQUENCE seq_grn_no START 1001;
CREATE SEQUENCE seq_purchase_invoice_no START 1001;
CREATE SEQUENCE seq_return_no START 1001;
CREATE SEQUENCE seq_expense_no START 1;
CREATE SEQUENCE seq_adjustment_no START 1;
CREATE SEQUENCE seq_customer_code START 1001;
