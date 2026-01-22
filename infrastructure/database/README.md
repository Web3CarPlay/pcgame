# 数据库设置

## 快速开始

### 1. 使用 Docker 启动 PostgreSQL

```bash
docker run -d \
  --name pcgame-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pcgame \
  -p 5432:5432 \
  postgres:15
```

### 2. 执行建表脚本

```bash
psql -h localhost -U postgres -d pcgame -f schema.sql
```

### 3. 插入测试数据

```bash
psql -h localhost -U postgres -d pcgame -f seed.sql
```

## 测试账户

| 用户名 | 密码 | 角色 | 初始余额 |
|--------|------|------|----------|
| admin | admin123 | admin | 0 |
| player001 | test123 | user | 10,000 |
| player002 | test123 | user | 5,000 |
| player003 | test123 | vip | 20,000 |
| player004 | test123 | user | 8,888 |
| player005 | test123 | user | 15,000 |

## 表结构

### users (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| username | VARCHAR(50) | 用户名 (唯一) |
| password | VARCHAR(255) | 密码 (bcrypt) |
| balance | DECIMAL(15,2) | 余额 |
| role | VARCHAR(20) | 角色 |

### pc28_rounds (轮次表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| issue_number | VARCHAR(50) | 期号 (唯一) |
| keno_data | JSONB | Keno 数据 |
| result_a/b/c | INTEGER | A/B/C 区结果 |
| sum | INTEGER | 和值 (0-27) |
| status | VARCHAR(20) | 状态 |

### pc28_bets (投注表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| user_id | INTEGER | 用户 ID (外键) |
| round_id | INTEGER | 轮次 ID (外键) |
| bet_type | VARCHAR(20) | 投注类型 |
| amount | DECIMAL(15,2) | 投注金额 |
| odds | DECIMAL(5,2) | 赔率 |
| status | VARCHAR(20) | 状态 |
| win_amount | DECIMAL(15,2) | 中奖金额 |
