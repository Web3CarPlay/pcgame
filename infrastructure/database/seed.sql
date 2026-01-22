-- PC28 Game Seed Data
-- 初始化测试数据

-- 清空现有数据 (谨慎使用)
-- TRUNCATE TABLE pc28_bets, pc28_rounds, users, operators, admin_users RESTART IDENTITY CASCADE;

-- ========================================
-- 管理员账户
-- ========================================

-- 超级管理员
-- 密码: admin123 (bcrypt hash)
INSERT INTO admin_users (username, password, role, status) VALUES
('superadmin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.e1BNBHfnj3nL6RjqGC', 'super_admin', 'active')
ON CONFLICT (username) DO NOTHING;

-- 普通管理员
-- 密码: admin123
INSERT INTO admin_users (username, password, role, status) VALUES
('admin1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.e1BNBHfnj3nL6RjqGC', 'admin', 'active'),
('admin2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.e1BNBHfnj3nL6RjqGC', 'admin', 'active')
ON CONFLICT (username) DO NOTHING;

-- 运营者账户
INSERT INTO admin_users (username, password, role, status) VALUES
('operator1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.e1BNBHfnj3nL6RjqGC', 'operator', 'active')
ON CONFLICT (username) DO NOTHING;

-- ========================================
-- 运营者
-- ========================================

-- admin1 创建的运营者 (假设 admin1 ID = 2)
INSERT INTO operators (code, name, commission, status, created_by_id) VALUES
('op001', '运营者A', 0.05, 'active', 2),
('op002', '运营者B', 0.08, 'active', 2)
ON CONFLICT (code) DO NOTHING;

-- admin2 创建的运营者 (假设 admin2 ID = 3)
INSERT INTO operators (code, name, commission, status, created_by_id) VALUES
('op003', '运营者C', 0.10, 'active', 3)
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 玩家用户
-- ========================================

-- 密码: test123 (bcrypt hash)
INSERT INTO users (username, password, balance, role, operator_id, referrer_id, invite_code) VALUES
('player001', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 10000.00, 'user', 1, NULL, 'a1b2c3d4'),
('player002', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 5000.00, 'user', 1, 1, 'e5f6g7h8'),
('player003', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 20000.00, 'user', 2, NULL, 'i9j0k1l2'),
('player004', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 8888.00, 'user', 3, NULL, 'm3n4o5p6'),
('player005', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 15000.00, 'user', 1, 1, 'q7r8s9t0')
ON CONFLICT (username) DO NOTHING;

-- ========================================
-- 历史轮次
-- ========================================

INSERT INTO pc28_rounds (issue_number, keno_data, result_a, result_b, result_c, sum, open_time, close_time, status) VALUES
('20260122120001', '[1,5,8,12,15,18,22,25,28,32,35,38,42,45,48,52,55,58,62,65]', 9, 0, 3, 12, '2026-01-22 12:00:00+08', '2026-01-22 12:00:55+08', 'settled'),
('20260122120101', '[3,7,11,14,17,21,24,27,31,34,37,41,44,47,51,54,57,61,64,67]', 3, 4, 4, 11, '2026-01-22 12:01:00+08', '2026-01-22 12:01:55+08', 'settled'),
('20260122120201', '[2,6,10,13,16,20,23,26,30,33,36,40,43,46,50,53,56,60,63,66]', 7, 8, 8, 23, '2026-01-22 12:02:00+08', '2026-01-22 12:02:55+08', 'settled')
ON CONFLICT (issue_number) DO NOTHING;

-- ========================================
-- 测试投注
-- ========================================

INSERT INTO pc28_bets (user_id, round_id, bet_type, bet_value, amount, odds, status, win_amount) VALUES
(1, 1, 'small', 0, 100.00, 1.95, 'won', 195.00),
(1, 1, 'odd', 0, 50.00, 1.95, 'lost', 0.00),
(2, 2, 'number', 11, 10.00, 9.80, 'won', 98.00),
(3, 3, 'big', 0, 500.00, 1.95, 'won', 975.00)
ON CONFLICT DO NOTHING;

-- ========================================
-- 显示结果
-- ========================================

SELECT '=== 数据初始化完成 ===' as info;

SELECT '管理员:' as type, count(*) as count FROM admin_users
UNION ALL SELECT '运营者:', count(*) FROM operators
UNION ALL SELECT '玩家:', count(*) FROM users
UNION ALL SELECT '轮次:', count(*) FROM pc28_rounds
UNION ALL SELECT '投注:', count(*) FROM pc28_bets;
