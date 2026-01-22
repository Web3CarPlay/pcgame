import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { betApi } from '../api/client';
import './History.css';

interface Bet {
    id: number;
    round_id: number;
    bet_type: string;
    bet_value: number;
    amount: number;
    odds: number;
    status: string;
    win_amount: number;
    created_at: string;
}

export default function History() {
    const [bets, setBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        betApi.getUserBets().then((res) => {
            if (res.data) setBets(res.data);
            setLoading(false);
        });
    }, []);

    const getBetTypeLabel = (type: string, value?: number) => {
        const labels: Record<string, string> = {
            big: '大',
            small: '小',
            odd: '单',
            even: '双',
            number: `数字 ${value}`,
        };
        return labels[type] || type;
    };

    const getStatusClass = (status: string) => {
        return status === 'won' ? 'won' : status === 'lost' ? 'lost' : 'pending';
    };

    return (
        <div className="history">
            <header className="history-header">
                <Link to="/game" className="back-btn">←</Link>
                <h1>投注记录</h1>
                <div style={{ width: 32 }}></div>
            </header>

            <div className="history-content">
                {loading ? (
                    <div className="loading">加载中...</div>
                ) : bets.length === 0 ? (
                    <div className="empty">
                        <span className="empty-icon">📝</span>
                        <p>暂无投注记录</p>
                    </div>
                ) : (
                    <div className="bet-list">
                        {bets.map((bet) => (
                            <div key={bet.id} className={`bet-card ${getStatusClass(bet.status)}`}>
                                <div className="bet-info">
                                    <span className="bet-type">{getBetTypeLabel(bet.bet_type, bet.bet_value)}</span>
                                    <span className="bet-round">第 {bet.round_id} 期</span>
                                </div>
                                <div className="bet-amount">
                                    <span className="amount">¥{bet.amount}</span>
                                    <span className="odds">×{bet.odds}</span>
                                </div>
                                <div className="bet-result">
                                    {bet.status === 'won' && (
                                        <span className="win">+¥{bet.win_amount}</span>
                                    )}
                                    {bet.status === 'lost' && (
                                        <span className="lose">-¥{bet.amount}</span>
                                    )}
                                    {bet.status === 'pending' && (
                                        <span className="pending">等待开奖</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
