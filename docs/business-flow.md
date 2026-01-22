# 业务流程

## 游戏轮次生命周期

```mermaid
stateDiagram-v2
    [*] --> Pending: 创建轮次
    Pending --> Open: 开放投注
    Open --> Closed: 投注截止
    Closed --> Settled: 结算完成
    Settled --> [*]
    
    Open --> Void: 管理员作废
    Void --> [*]
```

## 投注流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant API as 后端 API
    participant DB as 数据库
    participant WS as WebSocket
    
    U->>API: 发起投注请求
    API->>DB: 检查余额
    alt 余额充足
        API->>DB: 扣除余额
        API->>DB: 创建投注记录
        API->>U: 返回成功
    else 余额不足
        API->>U: 返回错误
    end
```

## 开奖流程

```mermaid
sequenceDiagram
    participant SCH as 调度器
    participant KENO as Keno 数据源
    participant GS as 游戏引擎
    participant DB as 数据库
    participant WS as WebSocket
    
    SCH->>SCH: 每分钟触发
    SCH->>KENO: 获取开奖数据
    KENO-->>SCH: 返回 20 个数字
    SCH->>GS: 计算 PC28 结果
    GS-->>SCH: A + B + C = Sum
    SCH->>DB: 更新轮次结果
    SCH->>WS: 广播开奖结果
    SCH->>GS: 触发结算
    GS->>DB: 更新所有注单状态
    GS->>DB: 中奖用户加余额
```

## PC28 算法

1. **输入**: Keno 开奖的 20 个数字 (1-80)
2. **排序**: 升序排列
3. **计算**:
   - A = Sum(索引 0-5) % 10
   - B = Sum(索引 6-11) % 10
   - C = Sum(索引 12-17) % 10
4. **输出**: Sum = A + B + C (范围 0-27)

## 投注类型与赔率

| 类型 | 条件 | 赔率 |
|------|------|------|
| 大 | Sum ∈ [14, 27] | 1.95 |
| 小 | Sum ∈ [0, 13] | 1.95 |
| 单 | Sum 为奇数 | 1.95 |
| 双 | Sum 为偶数 | 1.95 |
| 数字 | 猜中具体和值 | 9.8 |

## 倒计时机制

- 轮次时长: 60 秒
- 投注窗口: 55 秒
- 最后 5 秒: 等待开奖
- WebSocket 每秒推送剩余时间
