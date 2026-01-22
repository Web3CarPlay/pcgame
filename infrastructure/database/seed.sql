-- PC28 Game Seed Data
-- 初始化测试数据

-- 清空现有数据 (谨慎使用)
-- TRUNCATE TABLE pc28_bets, pc28_rounds, users RESTART IDENTITY CASCADE;

-- 插入管理员账户
-- 密码: admin123 (bcrypt hash)
INSERT INTO users (username, password, balance, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.e1BNBHfnj3nL6RjqGC', 0.00, 'admin')
ON CONFLICT (username) DO NOTHING;

-- 插入测试用户
-- 密码: test123 (bcrypt hash)
INSERT INTO users (username, password, balance, role) VALUES
('player001', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 10000.00, 'user'),
('player002', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 5000.00, 'user'),
('player003', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 20000.00, 'vip'),
('player004', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 8888.00, 'user'),
('player005', '$2a$10$rqV.WTNBGeMqnjrMd4ObuOY7A0YnBBLq8EW2LL0F8dJPWJEVVaD5G', 15000.00, 'user')
ON CONFLICT (username) DO NOTHING;

-- 插入历史轮次数据 (已结算)
INSERT INTO pc28_rounds (issue_number, keno_data, result_a, result_b, result_c, sum, open_time, close_time, status) VALUES
('20260122120001', '[1,5,8,12,15,18,22,25,28,32,35,38,42,45,48,52,55,58,62,65]', 9, 0, 3, 12, '2026-01-22 12:00:00+08', '2026-01-22 12:00:55+08', 'settled'),
('20260122120101', '[3,7,11,14,17,21,24,27,31,34,37,41,44,47,51,54,57,61,64,67]', 3, 4, 4, 11, '2026-01-22 12:01:00+08', '2026-01-22 12:01:55+08', 'settled'),
('20260122120201', '[2,6,10,13,16,20,23,26,30,33,36,40,43,46,50,53,56,60,63,66]', 7, 8, 8, 23, '2026-01-22 12:02:00+08', '2026-01-22 12:02:55+08', 'settled'),
('20260122120301', '[4,9,12,16,19,23,26,29,33,36,39,43,46,49,53,56,59,63,66,69]', 3, 6, 6, 15, '2026-01-22 12:03:00+08', '2026-01-22 12:03:55+08', 'settled'),
('20260122120401', '[1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,49,52,55,58]', 1, 5, 0, 6, '2026-01-22 12:04:00+08', '2026-01-22 12:04:55+08', 'settled')
ON CONFLICT (issue_number) DO NOTHING;

-- 插入测试投注记录
INSERT INTO pc28_bets (user_id, round_id, bet_type, bet_value, amount, odds, status, win_amount) VALUES
(2, 1, 'small', 0, 100.00, 1.95, 'won', 195.00),
(2, 1, 'odd', 0, 50.00, 1.95, 'lost', 0.00),
(3, 2, 'number', 11, 10.00, 9.80, 'won', 98.00),
(3, 2, 'big', 0, 200.00, 1.95, 'lost', 0.00),
(4, 3, 'big', 0, 500.00, 1.95, 'won', 975.00),
(4, 3, 'odd', 0, 100.00, 1.95, 'won', 195.00),
(5, 4, 'small', 0, 300.00, 1.95, 'lost', 0.00),
(5, 5, 'small', 0, 400.00, 1.95, 'won', 780.00)
ON CONFLICT DO NOTHING;

-- 显示插入结果
SELECT 'Users:' as info, count(*) as count FROM users
UNION ALL
SELECT 'Rounds:', count(*) FROM pc28_rounds
UNION ALL
SELECT 'Bets:', count(*) FROM pc28_bets;
