# PC28 Mobile Client (PWA)

移动端 PWA 应用，支持安装到主屏幕。

## 技术栈

- **构建**: Vite
- **框架**: React 18
- **路由**: React Router v7
- **状态**: Jotai
- **PWA**: vite-plugin-pwa

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建
npm run preview
```

## 功能模块

### 首页 (Home)
- 游戏介绍
- 余额显示
- 快速入口

### 投注 (Game)
- 倒计时显示
- 历史开奖条
- 快捷投注 (大/小/单/双)
- 数字网格 (0-27)
- 筹码选择
- 确认投注

### 记录 (History)
- 投注历史
- 输赢统计

### 我的 (Profile)
- 个人信息
- 余额管理
- 系统设置

## PWA 特性

- ✅ 可安装到主屏幕
- ✅ 离线缓存
- ✅ 启动画面
- ✅ 全屏模式

## 环境变量

创建 `.env.local`:

```env
VITE_API_BASE=http://localhost:8080
VITE_WS_BASE=ws://localhost:8080
```

## 目录结构

```
mobile-client/
├── src/
│   ├── api/           # API + WebSocket
│   ├── pages/         # 页面组件
│   └── store/         # Jotai atoms
├── public/            # 静态资源
└── vite.config.ts     # PWA 配置
```

## WebSocket 消息处理

```typescript
// 倒计时更新
{ type: 'countdown', payload: { seconds: 45 } }

// 开奖结果
{ type: 'result', payload: { sum: 15, ... } }

// 轮次更新
{ type: 'round_update', payload: { ... } }
```
