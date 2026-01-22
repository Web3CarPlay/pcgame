# PC28 Backend

Go 后端服务，提供 REST API 和 WebSocket 实时推送。

## 技术栈

- **框架**: Gin
- **ORM**: GORM
- **数据库**: PostgreSQL
- **WebSocket**: gorilla/websocket
- **调度**: robfig/cron
- **配置**: Viper
- **日志**: Zap

## 快速开始

```bash
# 安装依赖
go mod tidy

# 运行
go run ./cmd/server

# 构建
go build -o server ./cmd/server
```

## 目录结构

```
backend/
├── cmd/server/main.go     # 入口点
├── internal/
│   ├── api/               # HTTP 处理器
│   ├── config/            # 配置管理
│   ├── model/             # 数据模型
│   ├── service/           # 业务逻辑
│   ├── tasks/             # 定时任务
│   └── websocket/         # 实时推送
└── config.yaml            # 配置文件
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /health | 健康检查 |
| GET | /api/v1/games/pc28/round/current | 当前轮次 |
| GET | /api/v1/games/pc28/history | 历史记录 |
| GET | /api/v1/games/pc28/odds | 赔率信息 |
| POST | /api/v1/bets | 下注 |
| GET | /api/v1/bets | 投注记录 |
| WS | /ws | WebSocket |

## 配置

`config.yaml`:

```yaml
server:
  port: "8080"
  mode: "debug"  # debug, release

database:
  host: "localhost"
  port: "5432"
  user: "postgres"
  password: "postgres"
  dbname: "pcgame"
  sslmode: "disable"

jwt:
  secret: "your-secret-key"
  expireHour: 24

game:
  use_mock_data: true  # 使用 Mock 数据
```

## WebSocket 消息

```json
// 倒计时
{"type": "countdown", "payload": {"seconds": 45}}

// 开奖结果
{"type": "result", "payload": {"round_id": 1, "sum": 15, ...}}

// 轮次更新
{"type": "round_update", "payload": {...}}
```
