-- PC28 Game Database Schema
-- PostgreSQL

-- ========================================
-- Admin Users (管理员)
-- ========================================

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',  -- super_admin, admin, operator
    status VARCHAR(20) DEFAULT 'active'
);

CREATE INDEX idx_admin_users_deleted_at ON admin_users(deleted_at);
CREATE INDEX idx_admin_users_username ON admin_users(username);

-- ========================================
-- Operators (运营者)
-- ========================================

CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    commission DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_by_id INTEGER REFERENCES admin_users(id)
);

CREATE INDEX idx_operators_deleted_at ON operators(deleted_at);
CREATE INDEX idx_operators_code ON operators(code);
CREATE INDEX idx_operators_created_by_id ON operators(created_by_id);

-- ========================================
-- Users (玩家)
-- ========================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    role VARCHAR(20) DEFAULT 'user',
    operator_id INTEGER REFERENCES operators(id),
    referrer_id INTEGER REFERENCES users(id),
    invite_code VARCHAR(20) UNIQUE
);

CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_operator_id ON users(operator_id);
CREATE INDEX idx_users_referrer_id ON users(referrer_id);
CREATE INDEX idx_users_invite_code ON users(invite_code);

-- ========================================
-- PC28 Rounds (轮次)
-- ========================================

CREATE TABLE IF NOT EXISTS pc28_rounds (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    issue_number VARCHAR(50) UNIQUE NOT NULL,
    keno_data JSONB,
    result_a INTEGER DEFAULT 0,
    result_b INTEGER DEFAULT 0,
    result_c INTEGER DEFAULT 0,
    sum INTEGER DEFAULT 0,
    open_time TIMESTAMP WITH TIME ZONE NOT NULL,
    close_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE INDEX idx_pc28_rounds_deleted_at ON pc28_rounds(deleted_at);
CREATE INDEX idx_pc28_rounds_issue_number ON pc28_rounds(issue_number);
CREATE INDEX idx_pc28_rounds_status ON pc28_rounds(status);

-- ========================================
-- PC28 Bets (投注)
-- ========================================

CREATE TABLE IF NOT EXISTS pc28_bets (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    round_id INTEGER NOT NULL REFERENCES pc28_rounds(id),
    bet_type VARCHAR(20) NOT NULL,
    bet_value INTEGER DEFAULT 0,
    amount DECIMAL(15, 2) NOT NULL,
    odds DECIMAL(5, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    win_amount DECIMAL(15, 2) DEFAULT 0.00
);

CREATE INDEX idx_pc28_bets_deleted_at ON pc28_bets(deleted_at);
CREATE INDEX idx_pc28_bets_user_id ON pc28_bets(user_id);
CREATE INDEX idx_pc28_bets_round_id ON pc28_bets(round_id);
CREATE INDEX idx_pc28_bets_status ON pc28_bets(status);

-- ========================================
-- Comments
-- ========================================

COMMENT ON TABLE admin_users IS '管理员表';
COMMENT ON COLUMN admin_users.role IS '角色: super_admin(超级管理员), admin(管理员), operator(运营者)';

COMMENT ON TABLE operators IS '运营者表';
COMMENT ON COLUMN operators.code IS '运营者代码，用于邀请链接';
COMMENT ON COLUMN operators.created_by_id IS '创建此运营者的管理员ID';

COMMENT ON TABLE users IS '玩家用户表';
COMMENT ON COLUMN users.operator_id IS '归属运营者';
COMMENT ON COLUMN users.referrer_id IS '邀请人';
COMMENT ON COLUMN users.invite_code IS '用户邀请码';

COMMENT ON TABLE pc28_rounds IS 'PC28游戏轮次表';
COMMENT ON TABLE pc28_bets IS 'PC28投注表';
