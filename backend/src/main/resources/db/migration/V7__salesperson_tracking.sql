-- Ajith Store - Salesperson Tracking
-- V7: Salespersons, link to sales

-- ============================================================
-- SALESPERSONS
-- ============================================================
CREATE TABLE salespersons (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    email           VARCHAR(255),
    employee_code   VARCHAR(50) UNIQUE,
    commission_pct  DECIMAL(5,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sp_status ON salespersons(status);

-- Link sales to salesperson
ALTER TABLE sales ADD COLUMN salesperson_id BIGINT REFERENCES salespersons(id);
CREATE INDEX idx_sale_salesperson ON sales(salesperson_id);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO salespersons (name, employee_code, commission_pct, status) VALUES
    ('General Counter', 'GC001', 0, 'ACTIVE'),
    ('Priya Sharma', 'SP001', 1.5, 'ACTIVE'),
    ('Rahul Verma', 'SP002', 1.5, 'ACTIVE'),
    ('Anita Kumar', 'SP003', 2.0, 'ACTIVE'),
    ('Suresh Babu', 'SP004', 1.0, 'ACTIVE');
