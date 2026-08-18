-- Ajith Store - Roles table
-- V9: Add roles table with descriptions

CREATE TABLE roles (
    role        VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255),
    is_system   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO roles (role, description, is_system) VALUES
    ('ADMIN',   'Full system access. Can manage users, settings, and all modules.',   TRUE),
    ('MANAGER', 'Operations management. Can manage products, inventory, purchases, sales, and reports.', TRUE),
    ('CASHIER', 'Billing and customer service. Can process sales and manage customer information.', TRUE),
    ('BILLING', 'Billing and invoicing. Can process sales and view customer information.', TRUE);
