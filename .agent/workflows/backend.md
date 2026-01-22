---
description: how to develop backend API endpoints
---

# Backend API Development Workflow

## 技术栈
- **语言**: Go 1.21+
- **Web框架**: Gin
- **ORM**: GORM
- **数据库**: PostgreSQL / SQLite
- **认证**: JWT

## 项目结构
```
backend/
├── cmd/server/main.go    # 入口点
├── config.yaml           # 配置文件
├── internal/
│   ├── api/              # API 处理器
│   │   ├── admin.go      # 管理员接口
│   │   ├── handlers.go   # WebSocket 处理器
│   │   ├── middleware.go # 中间件
│   │   ├── operators.go  # 运营者接口
│   │   └── users.go      # 用户/玩家接口
│   ├── model/            # 数据模型
│   │   └── models.go     # GORM 模型定义
│   └── service/          # 业务逻辑
│       └── game.go       # 游戏服务
```

## 添加新 API 端点

1. 在对应的处理器文件中添加处理函数
2. 在 `SetupXxxRoutes` 函数中注册路由
3. 如需新模型，在 `model/models.go` 中定义

### API 处理器模板
```go
// GetSomething returns something
func (h *UserHandler) GetSomething(c *gin.Context) {
    userID, ok := GetUserIDFromContext(c)
    if !ok {
        c.JSON(401, gin.H{"error": "Not authenticated"})
        return
    }

    var result SomeType
    if err := h.db.Where("user_id = ?", userID).Find(&result).Error; err != nil {
        c.JSON(500, gin.H{"error": "Database error"})
        return
    }

    c.JSON(200, result)
}
```

### 注册路由
```go
player.GET("/something", h.GetSomething)
```

## 认证中间件

- `AuthMiddleware(db)` - 管理员认证
- `PlayerAuthMiddleware(db)` - 玩家认证

获取用户信息:
```go
userID, ok := GetUserIDFromContext(c)
user, ok := GetUserFromContext(c)
```

## RBAC 角色

- `super_admin` - 超级管理员，可见所有数据
- `admin` - 管理员，只能看到自己创建的运营者
- `operator` - 运营者，只能看到自己归属的用户
- `user` - 普通用户

## 运行后端

// turbo
```bash
cd d:\workspace\mycode\pcgame\backend
go mod tidy
go run ./cmd/server
```

## 运行测试

// turbo
```bash
cd d:\workspace\mycode\pcgame\backend
go test ./internal/service/... -v
```

## API 端点规范

- 玩家接口前缀: `/api/v1/player/...`
- 用户接口前缀: `/api/v1/users/...`
- 游戏接口前缀: `/api/v1/games/...`
- 投注接口前缀: `/api/v1/bets/...`
- 认证接口前缀: `/api/v1/auth/...`

## 前端对接

更新前端 API 客户端 `mobile-client/src/api/client.ts`:
```typescript
export const playerApi = {
    // 添加新接口
    getNewData: () => request<NewDataType>('/api/v1/player/new-endpoint', {}, true),
};
```
