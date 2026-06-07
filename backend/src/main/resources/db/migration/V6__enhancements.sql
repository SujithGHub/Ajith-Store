-- Ajith Store - Enhancements
-- V6: Stock ledger, price history, product images, expense categories,
--      draft sales, day closing, notifications, loyalty transactions

-- ============================================================
-- EXPENSE CATEGORIES
-- ============================================================
CREATE TABLE expense_categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Link existing expenses to categories
ALTER TABLE expenses ADD COLUMN expense_category_id BIGINT REFERENCES expense_categories(id);
CREATE INDEX idx_exp_cat ON expenses(expense_category_id);

-- ============================================================
-- STOCK LEDGER (Mandatory - every inventory movement)
-- ============================================================
CREATE TABLE stock_ledger (
    id                BIGSERIAL PRIMARY KEY,
    variant_id        BIGINT NOT NULL REFERENCES product_variants(id),
    transaction_type  VARCHAR(50) NOT NULL,
    reference_type    VARCHAR(100),
    reference_id      BIGINT,
    qty_in            DECIMAL(12,2) NOT NULL DEFAULT 0,
    qty_out           DECIMAL(12,2) NOT NULL DEFAULT 0,
    running_balance   DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_by        BIGINT REFERENCES users(id),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sl_variant ON stock_ledger(variant_id);
CREATE INDEX idx_sl_type ON stock_ledger(transaction_type);
CREATE INDEX idx_sl_ref ON stock_ledger(reference_type, reference_id);
CREATE INDEX idx_sl_created ON stock_ledger(created_at);

-- ============================================================
-- PRICE CHANGE HISTORY
-- ============================================================
CREATE TABLE price_change_history (
    id                  BIGSERIAL PRIMARY KEY,
    variant_id          BIGINT NOT NULL REFERENCES product_variants(id),
    old_purchase_price  DECIMAL(12,2),
    new_purchase_price  DECIMAL(12,2),
    old_selling_price   DECIMAL(12,2),
    new_selling_price   DECIMAL(12,2),
    old_mrp             DECIMAL(12,2),
    new_mrp             DECIMAL(12,2),
    changed_by          BIGINT REFERENCES users(id),
    reason              TEXT,
    changed_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pch_variant ON price_change_history(variant_id);
CREATE INDEX idx_pch_date ON price_change_history(changed_at);

-- ============================================================
-- PRODUCT IMAGES (multiple per product)
-- ============================================================
CREATE TABLE product_images (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pi_product ON product_images(product_id);

-- ============================================================
-- DRAFT SALES (Hold Bills)
-- ============================================================
CREATE TABLE draft_sales (
    id              BIGSERIAL PRIMARY KEY,
    draft_number    VARCHAR(50) NOT NULL UNIQUE,
    customer_id     BIGINT REFERENCES customers(id),
    notes           TEXT,
    status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ds_status ON draft_sales(status);
CREATE INDEX idx_ds_user ON draft_sales(created_by);

-- ============================================================
-- DRAFT SALE ITEMS
-- ============================================================
CREATE TABLE draft_sale_items (
    id              BIGSERIAL PRIMARY KEY,
    draft_id        BIGINT NOT NULL REFERENCES draft_sales(id) ON DELETE CASCADE,
    variant_id      BIGINT NOT NULL REFERENCES product_variants(id),
    quantity        DECIMAL(12,2) NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_dsi_draft ON draft_sale_items(draft_id);

-- ============================================================
-- DAY CLOSING
-- ============================================================
CREATE TABLE day_closing (
    id              BIGSERIAL PRIMARY KEY,
    closing_date    DATE NOT NULL,
    opening_cash    DECIMAL(12,2) NOT NULL DEFAULT 0,
    cash_sales      DECIMAL(12,2) NOT NULL DEFAULT 0,
    upi_sales       DECIMAL(12,2) NOT NULL DEFAULT 0,
    card_sales      DECIMAL(12,2) NOT NULL DEFAULT 0,
    credit_sales    DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_sales     DECIMAL(12,2) NOT NULL DEFAULT 0,
    expenses_total  DECIMAL(12,2) NOT NULL DEFAULT 0,
    closing_cash    DECIMAL(12,2) NOT NULL DEFAULT 0,
    expected_cash   DECIMAL(12,2) NOT NULL DEFAULT 0,
    difference      DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    closed_by       BIGINT REFERENCES users(id),
    closed_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(closing_date)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    reference_type  VARCHAR(100),
    reference_id    BIGINT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_read ON notifications(is_read);
CREATE INDEX idx_notif_type ON notifications(type);
CREATE INDEX idx_notif_created ON notifications(created_at);

-- ============================================================
-- LOYALTY TRANSACTIONS
-- ============================================================
CREATE TABLE loyalty_transactions (
    id                BIGSERIAL PRIMARY KEY,
    customer_id       BIGINT NOT NULL REFERENCES customers(id),
    transaction_type  VARCHAR(50) NOT NULL,
    points            DECIMAL(12,2) NOT NULL,
    reference_type    VARCHAR(100),
    reference_id      BIGINT,
    notes             TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lt_customer ON loyalty_transactions(customer_id);
CREATE INDEX idx_lt_type ON loyalty_transactions(transaction_type);

-- ============================================================
-- SEQUENCE for draft sales
-- ============================================================
CREATE SEQUENCE seq_draft_no START 1;

-- ============================================================
-- SEED DATA for new master tables
-- ============================================================

-- Colors
INSERT INTO colors (name, hex_code, status) VALUES
    ('Red', '#FF0000', 'ACTIVE'),
    ('Blue', '#0000FF', 'ACTIVE'),
    ('Black', '#000000', 'ACTIVE'),
    ('White', '#FFFFFF', 'ACTIVE'),
    ('Green', '#22C55E', 'ACTIVE'),
    ('Yellow', '#F59E0B', 'ACTIVE'),
    ('Pink', '#FFC0CB', 'ACTIVE'),
    ('Purple', '#800080', 'ACTIVE'),
    ('Orange', '#FFA500', 'ACTIVE'),
    ('Grey', '#808080', 'ACTIVE'),
    ('Navy Blue', '#000080', 'ACTIVE'),
    ('Maroon', '#800000', 'ACTIVE'),
    ('Beige', '#F5F5DC', 'ACTIVE'),
    ('Brown', '#8B4513', 'ACTIVE'),
    ('Gold', '#FFD700', 'ACTIVE');

-- Sizes
INSERT INTO sizes (name, display_order, status) VALUES
    ('XS', 1, 'ACTIVE'),
    ('S', 2, 'ACTIVE'),
    ('M', 3, 'ACTIVE'),
    ('L', 4, 'ACTIVE'),
    ('XL', 5, 'ACTIVE'),
    ('XXL', 6, 'ACTIVE'),
    ('XXXL', 7, 'ACTIVE'),
    ('28', 8, 'ACTIVE'),
    ('30', 9, 'ACTIVE'),
    ('32', 10, 'ACTIVE'),
    ('34', 11, 'ACTIVE'),
    ('36', 12, 'ACTIVE'),
    ('38', 13, 'ACTIVE'),
    ('40', 14, 'ACTIVE'),
    ('42', 16, 'ACTIVE'),
    ('44', 17, 'ACTIVE'),
    ('Free Size', 15, 'ACTIVE');

-- Fabrics
INSERT INTO fabrics (name, description, status) VALUES
    ('Cotton', '100% pure cotton fabric — breathable and comfortable', 'ACTIVE'),
    ('Silk', 'Pure silk fabric — luxurious and smooth', 'ACTIVE'),
    ('Linen', 'Linen fabric — lightweight and breathable', 'ACTIVE'),
    ('Polyester', 'Polyester blend fabric — durable and wrinkle-resistant', 'ACTIVE'),
    ('Wool', 'Woolen fabric — warm and cozy', 'ACTIVE'),
    ('Denim', 'Denim fabric — sturdy cotton twill', 'ACTIVE'),
    ('Rayon', 'Rayon fabric — soft and versatile', 'ACTIVE'),
    ('Nylon', 'Nylon fabric — strong and elastic', 'ACTIVE'),
    ('Velvet', 'Velvet fabric — soft with a smooth nap', 'ACTIVE'),
    ('Jersey', 'Jersey knit fabric — stretchy and comfortable', 'ACTIVE'),
    ('Chiffon', 'Chiffon fabric — lightweight and sheer', 'ACTIVE'),
    ('Georgette', 'Georgette fabric — sheer and flowy', 'ACTIVE'),
    ('Satin', 'Satin fabric — glossy and smooth', 'ACTIVE'),
    ('Khaki', 'Khaki fabric — durable cotton blend', 'ACTIVE');

-- Patterns
INSERT INTO patterns (name, description, status) VALUES
    ('Plain', 'Solid plain color — no pattern', 'ACTIVE'),
    ('Checked', 'Checkered pattern — criss-cross design', 'ACTIVE'),
    ('Striped', 'Striped pattern — linear design', 'ACTIVE'),
    ('Printed', 'Printed design — various motifs', 'ACTIVE'),
    ('Embroidered', 'Embroidered design — stitched patterns', 'ACTIVE'),
    ('Polka Dot', 'Polka dot pattern — circular dots', 'ACTIVE'),
    ('Floral', 'Floral pattern — flower designs', 'ACTIVE'),
    ('Geometric', 'Geometric pattern — shapes and lines', 'ACTIVE'),
    ('Self Design', 'Self textured design — woven texture', 'ACTIVE'),
    ('Woven', 'Woven design — intricate weave patterns', 'ACTIVE'),
    ('Tie & Dye', 'Tie and dye pattern', 'ACTIVE'),
    ('Block Print', 'Hand block printed design', 'ACTIVE');

-- Tax Groups
INSERT INTO tax_groups (name, cgst_pct, sgst_pct, igst_pct, status) VALUES
    ('GST 0%', 0, 0, 0, 'ACTIVE'),
    ('GST 5%', 2.5, 2.5, 5, 'ACTIVE'),
    ('GST 12%', 6, 6, 12, 'ACTIVE'),
    ('GST 18%', 9, 9, 18, 'ACTIVE'),
    ('GST 28%', 14, 14, 28, 'ACTIVE');

-- Expense Categories
INSERT INTO expense_categories (name, description, status) VALUES
    ('Rent', 'Store rent and lease payments', 'ACTIVE'),
    ('Salary', 'Employee salaries and wages', 'ACTIVE'),
    ('Electricity', 'Electricity and utility bills', 'ACTIVE'),
    ('Maintenance', 'Store and equipment maintenance', 'ACTIVE'),
    ('Transport', 'Transportation and logistics', 'ACTIVE'),
    ('Miscellaneous', 'Other expenses not categorized', 'ACTIVE'),
    ('Marketing', 'Marketing and advertising costs', 'ACTIVE'),
    ('Insurance', 'Store and inventory insurance', 'ACTIVE'),
    ('Taxes', 'Tax payments and govt fees', 'ACTIVE'),
    ('Supplies', 'Office and store supplies', 'ACTIVE'),
    ('Water', 'Water bills', 'ACTIVE'),
    ('Internet', 'Internet and phone bills', 'ACTIVE'),
    ('Security', 'Security services', 'ACTIVE'),
    ('Cleaning', 'Cleaning and housekeeping', 'ACTIVE');
