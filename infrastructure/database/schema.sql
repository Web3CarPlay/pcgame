-- PC28 Game Database Schema
-- PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    role VARCHAR(20) DEFAULT 'user'
);

CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_username ON users(username);

-- PC28 Rounds table
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
CREATE INDEX idx_pc28_rounds_open_time ON pc28_rounds(open_time);

-- PC28 Bets table
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

-- Comments
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.balance IS '账户余额';
COMMENT ON COLUMN users.role IS '角色: user, vip, admin';

COMMENT ON TABLE pc28_rounds IS 'PC28 游戏轮次表';
COMMENT ON COLUMN pc28_rounds.issue_number IS '期号';
COMMENT ON COLUMN pc28_rounds.keno_data IS 'Keno 原始数据 (20个数字)';
COMMENT ON COLUMN pc28_rounds.result_a IS 'A 区结果 (0-9)';
COMMENT ON COLUMN pc28_rounds.result_b IS 'B 区结果 (0-9)';
COMMENT ON COLUMN pc28_rounds.result_c IS 'C 区结果 (0-9)';
COMMENT ON COLUMN pc28_rounds.sum IS '和值 (0-27)';
COMMENT ON COLUMN pc28_rounds.status IS '状态: pending, open, closed, settled, void';

COMMENT ON TABLE pc28_bets IS 'PC28 投注表';
COMMENT ON COLUMN pc28_bets.bet_type IS '投注类型: number, big, small, odd, even, big_odd, big_even, small_odd, small_even';
COMMENT ON COLUMN pc28_bets.bet_value IS '猜数字时的具体值 (0-27)';
COMMENT ON COLUMN pc28_bets.status IS '状态: pending, won, lost, refunded';
