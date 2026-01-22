---
description: how to generate consistent black-gold themed images for the app
---

# Image Generation Workflow

## 黑金风格图片规范

### 颜色调色板
- **主色**: 纯黑 #0a0a0f
- **辅助色**: 深灰 #12121a, #1a1a2e
- **金色渐变**: #c4881a → #f5af19 → #f8c842
- **点缀色**: 白色高光 (不超过 10%)

### 生成提示词模板

#### 游戏 Banner (16:9)
```
Premium black and gold themed mobile game banner for a [游戏类型] game called "[游戏名称]". 
Features [游戏元素], and elegant gold gradient effects on a dark black background. 
Minimalist luxury style with glowing gold accents. No text. 16:9 aspect ratio, mobile UI ready.
```

#### 页面背景/Header
```
Luxurious black and gold themed header background for a mobile [页面类型]. 
Features abstract golden geometric patterns, subtle sparkles, and elegant gradient from pure black to dark charcoal with gold accent lighting. 
Premium casino feel. No text. Wide banner format.
```

#### 图标/徽章
```
Minimalist black and gold icon for [功能描述]. 
Simple geometric design with gold gradient on black background. 
Clean lines, premium feel. Square format, suitable for app icon.
```

## 生成后处理

1. 生成图片
2. 复制到 `mobile-client/src/assets/` 目录
3. 在组件中导入并使用

```bash
# 复制图片命令
copy "[生成路径]" "d:\workspace\mycode\pcgame\mobile-client\src\assets\[名称].png"
```

## 使用示例

```tsx
import gameBanner from '../assets/game_banner.png';

// 在组件中
<img src={gameBanner} alt="游戏" />
```

## CSS 背景使用

```css
.header-bg {
    background: url('../assets/header.png') center/cover no-repeat;
    opacity: 0.6; /* 可调整透明度 */
}
```
