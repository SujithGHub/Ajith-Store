-- Ajith Store - Account Lockout & Security
-- V8: Add account lockout fields to users table

ALTER TABLE users
    ADD COLUMN locked              BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN locked_until        TIMESTAMP;
