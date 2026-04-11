-- Online Banking System - Database Schema
-- PostgreSQL 14+

-- Enable UUID generator extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing types if they exist (for clean setup)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;
DROP TYPE IF EXISTS txn_direction CASCADE;
DROP TYPE IF EXISTS txn_kind CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('user','admin');
CREATE TYPE account_type AS ENUM ('main','savings');
CREATE TYPE txn_direction AS ENUM ('debit','credit');
CREATE TYPE txn_kind AS ENUM ('deposit','withdrawal','transfer','bill_payment','fee','adjustment');

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS bill_payments CASCADE;
DROP TABLE IF EXISTS bill_services CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  suspended_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_full_name ON users (full_name);
CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_users_role ON users (role);

COMMENT ON TABLE users IS 'User accounts for the banking system';
COMMENT ON COLUMN users.role IS 'User role: user or admin';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN users.suspended_at IS 'Timestamp when user was suspended (if applicable)';

-- ACCOUNTS TABLE
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type account_type NOT NULL,
  account_number VARCHAR(32) NOT NULL UNIQUE,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT positive_balance CHECK (balance >= 0),
  CONSTRAINT valid_currency CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX idx_accounts_user ON accounts (user_id);
CREATE INDEX idx_accounts_account_number ON accounts (account_number);
CREATE INDEX idx_accounts_created_at ON accounts (created_at);

COMMENT ON TABLE accounts IS 'Bank accounts linked to users';
COMMENT ON COLUMN accounts.account_type IS 'Type of account: main or savings';
COMMENT ON COLUMN accounts.account_number IS 'Unique account identifier';
COMMENT ON COLUMN accounts.balance IS 'Current account balance';

-- TRANSACTIONS TABLE
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  direction txn_direction NOT NULL,
  kind txn_kind NOT NULL,
  purpose TEXT,
  reference VARCHAR(64),
  initiated_by UUID REFERENCES users(id),
  counterparty_account_id UUID,
  counterparty_name VARCHAR(150),
  transfer_group_id UUID,
  created_by_ip INET,
  CONSTRAINT chk_counterparty_diff CHECK (counterparty_account_id IS NULL OR counterparty_account_id <> account_id)
);

CREATE INDEX idx_txn_account_created_at ON transactions (account_id, created_at DESC);
CREATE INDEX idx_txn_created_at ON transactions (created_at DESC);
CREATE INDEX idx_txn_purpose_gin ON transactions USING gin (to_tsvector('english', coalesce(purpose,'')));
CREATE INDEX idx_txn_reference ON transactions (reference);
CREATE INDEX idx_txn_direction ON transactions (direction);
CREATE INDEX idx_txn_kind ON transactions (kind);
CREATE INDEX idx_txn_transfer_group ON transactions (transfer_group_id) WHERE transfer_group_id IS NOT NULL;

COMMENT ON TABLE transactions IS 'All financial transactions';
COMMENT ON COLUMN transactions.direction IS 'Transaction direction: debit or credit';
COMMENT ON COLUMN transactions.kind IS 'Transaction type: deposit, withdrawal, transfer, bill_payment, fee, adjustment';
COMMENT ON COLUMN transactions.transfer_group_id IS 'Links related transactions in a transfer';

-- BILL SERVICES TABLE
CREATE TABLE bill_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_bill_services_name ON bill_services (name);

COMMENT ON TABLE bill_services IS 'Available bill payment services';

-- BILL PAYMENTS TABLE
CREATE TABLE bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  bill_service_id UUID NOT NULL REFERENCES bill_services(id),
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  purpose TEXT,
  transaction_id UUID REFERENCES transactions(id),
  created_by_ip INET
);

CREATE INDEX idx_bill_payments_user ON bill_payments (user_id, paid_at DESC);
CREATE INDEX idx_bill_payments_account ON bill_payments (account_id);
CREATE INDEX idx_bill_payments_service ON bill_payments (bill_service_id);
CREATE INDEX idx_bill_payments_paid_at ON bill_payments (paid_at DESC);

COMMENT ON TABLE bill_payments IS 'Bill payment records';

-- ADMIN ACTIONS TABLE
CREATE TABLE admin_actions (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id UUID REFERENCES users(id),
  action_type VARCHAR(80) NOT NULL,
  target_user_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_actions_admin ON admin_actions (admin_user_id);
CREATE INDEX idx_admin_actions_target ON admin_actions (target_user_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions (created_at DESC);
CREATE INDEX idx_admin_actions_type ON admin_actions (action_type);

COMMENT ON TABLE admin_actions IS 'Log of administrative actions';
COMMENT ON COLUMN admin_actions.action_type IS 'Type of action performed (e.g., update_user, delete_user)';
COMMENT ON COLUMN admin_actions.details IS 'JSON details of the action';

-- Insert sample bill services
INSERT INTO bill_services (name, description) VALUES
  ('Electricity Bill', 'Pay your electricity bills online'),
  ('Water Bill', 'Pay your water utility bills'),
  ('Internet Service', 'Pay your internet service provider bills'),
  ('Phone Service', 'Pay your mobile or landline phone bills'),
  ('Credit Card', 'Pay your credit card bills');

-- Create admin user (password: admin123)
-- Note: The password hash below is for 'admin123' using bcrypt
INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES
  ('HakiBank Admin', 'admin@hakibank.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5oCy.9eYW7Q3K', 'admin', true);

-- Grant permissions (if using PostgreSQL roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO banking_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO banking_app_user;

-- Useful views for reporting

-- View: Recent Transactions with User Info
CREATE OR REPLACE VIEW v_recent_transactions AS
SELECT 
  t.id,
  t.created_at,
  t.amount,
  t.direction,
  t.kind,
  t.purpose,
  t.reference,
  a.account_number,
  u.full_name as account_holder,
  u.email as account_holder_email,
  t.counterparty_name
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN users u ON a.user_id = u.id
ORDER BY t.created_at DESC;

-- View: User Account Summary
CREATE OR REPLACE VIEW v_user_account_summary AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  u.role,
  u.is_active,
  u.created_at as user_since,
  COUNT(DISTINCT a.id) as account_count,
  COALESCE(SUM(a.balance), 0) as total_balance,
  COUNT(DISTINCT t.id) as transaction_count
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id
LEFT JOIN transactions t ON a.id = t.account_id
GROUP BY u.id, u.full_name, u.email, u.role, u.is_active, u.created_at;

-- View: Daily Transaction Summary
CREATE OR REPLACE VIEW v_daily_transaction_summary AS
SELECT 
  DATE(created_at) as transaction_date,
  kind as transaction_type,
  direction,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM transactions
GROUP BY DATE(created_at), kind, direction
ORDER BY transaction_date DESC, kind;

COMMENT ON VIEW v_recent_transactions IS 'Recent transactions with user information';
COMMENT ON VIEW v_user_account_summary IS 'Summary of users with their accounts and transactions';
COMMENT ON VIEW v_daily_transaction_summary IS 'Daily summary of transactions by type';

-- Database setup complete
-- Run: psql -U postgres -d banking_db -f database_schema.sql

