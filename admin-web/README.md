# PC28 Admin Web

管理后台，用于游戏运营管理。

## 技术栈

- **构建**: Vite
- **框架**: React 18
- **路由**: React Router v7
- **状态**: Jotai
- **请求**: TanStack Query

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 功能模块

### 仪表盘 (Dashboard)
- 今日统计
- 当前轮次状态
- 最近开奖记录

### 轮次管理 (Rounds)
- 查看所有轮次
- 作废操作
- 手动开奖

### 用户管理 (Users)
- 用户列表
- 余额查看
- 投注历史

### 系统设置 (Settings)
- 游戏参数配置
- 赔率管理
- 数据源切换

## 环境变量

创建 `.env.local`:

```env
VITE_API_BASE=http://localhost:8080
```

## 目录结构

```
admin-web/
├── src/
│   ├── api/           # API 客户端
│   ├── components/    # 通用组件
│   ├── pages/         # 页面组件
│   └── store/         # Jotai atoms
└── vite.config.ts
```
