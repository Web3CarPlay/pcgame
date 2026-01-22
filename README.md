# PC28 Game

基于 Keno 数据源的 PC28 竞猜游戏系统。

## 项目结构

```
pcgame/
├── backend/           # Go 后端服务
├── admin-web/         # 管理后台 (React)
├── mobile-client/     # 移动端 PWA (React)
├── infrastructure/    # 数据库脚本
└── docs/              # 项目文档
```

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Go, Gin, GORM, PostgreSQL, WebSocket |
| 管理后台 | Vite, React, React Router v7, Jotai |
| 移动端 | Vite, React, Jotai, PWA |

## 快速开始

### 1. 初始化数据库

```bash
# 启动 PostgreSQL
docker run -d --name pcgame-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pcgame \
  -p 5432:5432 postgres:15

# 建表
psql -h localhost -U postgres -d pcgame -f infrastructure/database/schema.sql

# 初始化数据
psql -h localhost -U postgres -d pcgame -f infrastructure/database/seed.sql
```

### 2. 启动后端

```bash
cd backend
go mod tidy
go run ./cmd/server
# 服务运行在 http://localhost:8080
```

### 3. 启动管理后台

```bash
cd admin-web
npm install
npm run dev
# 访问 http://localhost:5173
```

### 4. 启动移动端

```bash
cd mobile-client
npm install
npm run dev
# 访问 http://localhost:5174
```

## 文档

| 文档 | 说明 |
|------|------|
| [项目架构](docs/architecture.md) | 系统架构和目录结构 |
| [业务流程](docs/business-flow.md) | 游戏逻辑和时序图 |
| [数据源配置](docs/data-source.md) | Keno 数据源和 Mock 模式 |
| [数据库设置](infrastructure/database/README.md) | 建表和测试数据 |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/games/pc28/round/current | 当前轮次 |
| GET | /api/v1/games/pc28/history | 历史记录 |
| GET | /api/v1/games/pc28/odds | 赔率信息 |
| POST | /api/v1/bets | 下注 |
| GET | /api/v1/bets | 投注记录 |
| WS | /ws | WebSocket 连接 |

## 测试账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| player001 | test123 | 玩家 |

## 环境变量

```env
# 后端
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=pcgame

# 前端
VITE_API_BASE=http://localhost:8080
VITE_WS_BASE=ws://localhost:8080
```

## 待扩展

- [ ] JWT 认证中间件
- [ ] 商业 Keno API 接入
- [ ] Docker Compose 部署
- [ ] 单元测试覆盖
- [ ] 监控和告警
