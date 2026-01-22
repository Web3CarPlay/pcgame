---
description: how to develop mobile-client pages and components
---

# Mobile Client Development Workflow

## 技术栈
- **构建**: Vite 7.x
- **框架**: React 19
- **路由**: React Router v7
- **状态**: Jotai (atoms)
- **样式**: Vanilla CSS with CSS Variables
- **PWA**: vite-plugin-pwa

## 设计规范 (黑金主题)

### 颜色变量 (定义在 `src/index.css`)
```css
--color-bg-primary: #0a0a0f        /* 主背景色 */
--color-bg-secondary: #12121a      /* 次背景色 */
--color-bg-card: rgba(20, 20, 30, 0.9)  /* 卡片背景 */
--color-gold-primary: #f5af19      /* 主金色 */
--color-gold-secondary: #f8c842    /* 亮金色 */
--color-gold-gradient: linear-gradient(135deg, #f5af19 0%, #f8c842 50%, #f5af19 100%)
--color-success: #00d4aa           /* 成功/盈利 */
--color-danger: #ff4757            /* 危险/亏损 */
```

### 工具类
- `.gold-text` - 金色渐变文字
- `.gold-button` - 金色渐变按钮
- `.glass-card` - 毛玻璃卡片
- `.glass-card-gold` - 金边毛玻璃卡片

## 创建新页面步骤

// turbo-all
1. 创建页面组件 `src/pages/NewPage.tsx`
2. 创建样式文件 `src/pages/NewPage.css`
3. 在 `src/App.tsx` 中添加导入和路由
4. 更新底部导航（如需要）

### 页面模板
```tsx
import { Link } from 'react-router-dom';
import './NewPage.css';

export default function NewPage() {
    return (
        <div className="newpage">
            <header className="page-header">
                <h1>页面标题</h1>
            </header>
            
            <div className="page-content">
                {/* 内容 */}
            </div>

            <nav className="bottom-nav">
                <Link to="/" className="nav-item">
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">首页</span>
                </Link>
                <Link to="/lobby" className="nav-item">
                    <span className="nav-icon">🎮</span>
                    <span className="nav-label">游戏</span>
                </Link>
                <Link to="/history" className="nav-item">
                    <span className="nav-icon">📜</span>
                    <span className="nav-label">记录</span>
                </Link>
                <Link to="/profile" className="nav-item">
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">我的</span>
                </Link>
            </nav>
        </div>
    );
}
```

### CSS 模板
```css
.newpage {
    min-height: 100vh;
    background: linear-gradient(180deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
    padding-bottom: 90px;
}

.page-header {
    padding: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: var(--border-subtle);
}

.page-content {
    padding: 20px;
}
```

## 添加新游戏到游戏大厅

1. 准备游戏 banner 图片 (黑金风格, 16:9)
2. 将图片放入 `src/assets/`
3. 编辑 `src/pages/GameLobby.tsx`
4. 在 `GAMES` 数组中添加新游戏配置:

```tsx
{
    id: 'new-game',
    name: '游戏名称',
    subtitle: '游戏副标题',
    description: '游戏描述...',
    icon: '🎯',
    banner: newGameBanner,
    route: '/new-game',
    status: 'coming-soon', // 或 'live'
    tags: ['标签1', '标签2'],
    stats: [
        { label: '统计1', value: '值1' },
        { label: '统计2', value: '值2' },
        { label: '统计3', value: '值3' },
    ],
}
```

## 验证构建

// turbo
```bash
cd d:\workspace\mycode\pcgame\mobile-client
npm run build
```

## 开发服务器

// turbo
```bash
cd d:\workspace\mycode\pcgame\mobile-client
npm run dev
```
