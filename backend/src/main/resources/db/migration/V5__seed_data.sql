-- Ajith Store - Seed Data
-- Default store, admin user, roles, sample categories

-- ============================================================
-- DEFAULT STORE
-- ============================================================
INSERT INTO store_config (store_name, address, phone, email, gst_number, currency)
VALUES (
    'Ajith Store',
    '123, Main Road, City - 600001',
    '+91-9876543210',
    'ajithstore@email.com',
    '33ABCDE1234F1Z5',
    'INR'
);

-- ============================================================
-- DEFAULT ADMIN USER (password: admin123)
-- Password hash for BCrypt
-- ============================================================
INSERT INTO users (store_id, username, password_hash, full_name, role, enabled)
VALUES (
    1,
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Administrator',
    'ADMIN',
    TRUE
);

INSERT INTO users (store_id, username, password_hash, full_name, role, enabled)
VALUES (
    1,
    'manager',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Manager',
    'MANAGER',
    TRUE
);

INSERT INTO users (store_id, username, password_hash, full_name, role, enabled)
VALUES (
    1,
    'cashier',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Cashier',
    'CASHIER',
    TRUE
);

-- ============================================================
-- ROLE PERMISSIONS
-- ============================================================
-- ADMIN: Full access to everything
INSERT INTO role_permissions (role, module, feature, can_create, can_read, can_update, can_delete)
SELECT 'ADMIN', m.module, f.feature, TRUE, TRUE, TRUE, TRUE
FROM (VALUES
    ('STORE_CONFIG'), ('USERS'), ('PRODUCTS'), ('INVENTORY'),
    ('SUPPLIERS'), ('PURCHASES'), ('CUSTOMERS'), ('SALES'),
    ('RETURNS'), ('EXPENSES'), ('REPORTS'), ('DASHBOARD'),
    ('SETTINGS'), ('AUDIT')
) AS m(module)
CROSS JOIN (VALUES ('MANAGE'), ('VIEW')) AS f(feature);

-- MANAGER: Most access except user management and audit
INSERT INTO role_permissions (role, module, feature, can_create, can_read, can_update, can_delete)
SELECT 'MANAGER', m.module, 'MANAGE', TRUE, TRUE, TRUE, TRUE
FROM (VALUES
    ('PRODUCTS'), ('INVENTORY'), ('SUPPLIERS'), ('PURCHASES'),
    ('CUSTOMERS'), ('SALES'), ('RETURNS'), ('EXPENSES'),
    ('REPORTS'), ('DASHBOARD')
) AS m(module);

INSERT INTO role_permissions (role, module, feature, can_create, can_read, can_update, can_delete)
SELECT 'MANAGER', m.module, 'VIEW', TRUE, TRUE, TRUE, TRUE
FROM (VALUES
    ('STORE_CONFIG'), ('SETTINGS')
) AS m(module);

-- CASHIER: Billing, customer lookup, basic sales
INSERT INTO role_permissions (role, module, feature, can_create, can_read, can_update, can_delete)
VALUES
    ('CASHIER', 'SALES', 'MANAGE', TRUE, TRUE, TRUE, FALSE),
    ('CASHIER', 'CUSTOMERS', 'MANAGE', TRUE, TRUE, TRUE, FALSE),
    ('CASHIER', 'RETURNS', 'MANAGE', TRUE, TRUE, FALSE, FALSE),
    ('CASHIER', 'DASHBOARD', 'VIEW', FALSE, TRUE, FALSE, FALSE);

-- BILLING: Same as cashier but read-only on customers
INSERT INTO role_permissions (role, module, feature, can_create, can_read, can_update, can_delete)
VALUES
    ('BILLING', 'SALES', 'MANAGE', TRUE, TRUE, TRUE, FALSE),
    ('BILLING', 'CUSTOMERS', 'VIEW', FALSE, TRUE, FALSE, FALSE),
    ('BILLING', 'DASHBOARD', 'VIEW', FALSE, TRUE, FALSE, FALSE);

-- ============================================================
-- DEFAULT CATEGORIES
-- ============================================================
INSERT INTO categories (name, sort_order, status) VALUES
    ('Men', 1, 'ACTIVE'),
    ('Women', 2, 'ACTIVE'),
    ('Kids', 3, 'ACTIVE'),
    ('Accessories', 4, 'ACTIVE');

-- ============================================================
-- SUB-CATEGORIES
-- ============================================================
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Shirts', id, 1, 'ACTIVE' FROM categories WHERE name = 'Men';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'T-Shirts', id, 2, 'ACTIVE' FROM categories WHERE name = 'Men';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Jeans', id, 3, 'ACTIVE' FROM categories WHERE name = 'Men';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Trousers', id, 4, 'ACTIVE' FROM categories WHERE name = 'Men';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Suits & Blazers', id, 5, 'ACTIVE' FROM categories WHERE name = 'Men';

INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Sarees', id, 1, 'ACTIVE' FROM categories WHERE name = 'Women';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Salwar Kameez', id, 2, 'ACTIVE' FROM categories WHERE name = 'Women';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Kurtis', id, 3, 'ACTIVE' FROM categories WHERE name = 'Women';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Dresses', id, 4, 'ACTIVE' FROM categories WHERE name = 'Women';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Jeans & Tops', id, 5, 'ACTIVE' FROM categories WHERE name = 'Women';

INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Boys Wear', id, 1, 'ACTIVE' FROM categories WHERE name = 'Kids';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Girls Wear', id, 2, 'ACTIVE' FROM categories WHERE name = 'Kids';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Infants', id, 3, 'ACTIVE' FROM categories WHERE name = 'Kids';

INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Belts', id, 1, 'ACTIVE' FROM categories WHERE name = 'Accessories';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Wallets', id, 2, 'ACTIVE' FROM categories WHERE name = 'Accessories';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Watches', id, 3, 'ACTIVE' FROM categories WHERE name = 'Accessories';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Sunglasses', id, 4, 'ACTIVE' FROM categories WHERE name = 'Accessories';
INSERT INTO categories (name, parent_id, sort_order, status)
SELECT 'Ties & Accessories', id, 5, 'ACTIVE' FROM categories WHERE name = 'Accessories';

-- ============================================================
-- LOYALTY DEFAULTS
-- ============================================================
INSERT INTO loyalty_settings (points_per_rupee, redemption_rate, min_redemption_points, max_redemption_pct, enabled)
VALUES (1, 1, 100, 50, FALSE);
