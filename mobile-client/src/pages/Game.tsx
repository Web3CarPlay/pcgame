import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import {
    currentRoundAtom,
    countdownAtom,
    selectedBetsAtom,
    chipAmountAtom,
    userAtom
} from '../store/atoms';
import { gameApi, betApi, createWebSocket } from '../api/client';
import './Game.css';

const NUMBERS = Array.from({ length: 28 }, (_, i) => i);
const CHIPS = [10, 50, 100, 500, 1000];

export default function Game() {
    const [user] = useAtom(userAtom);
    const [currentRound, setCurrentRound] = useAtom(currentRoundAtom);
    const [countdown, setCountdown] = useAtom(countdownAtom);
    const [selectedBets, setSelectedBets] = useAtom(selectedBetsAtom);
    const [chipAmount, setChipAmount] = useAtom(chipAmountAtom);
    const [recentResults, setRecentResults] = useState<number[]>([]);

    useEffect(() => {
        // Fetch current round
        gameApi.getCurrentRound().then((res) => {
            if (res.data) setCurrentRound(res.data);
        });

        // Fetch history
        gameApi.getHistory().then((res) => {
            if (res.data) {
                setRecentResults(res.data.slice(0, 10).map((r: any) => r.sum));
            }
        });

        // WebSocket connection
        const ws = createWebSocket((msg) => {
            if (msg.type === 'countdown') {
                setCountdown(msg.payload.seconds);
            } else if (msg.type === 'result') {
                setRecentResults((prev) => [msg.payload.sum, ...prev.slice(0, 9)]);
                setSelectedBets([]);
            } else if (msg.type === 'round_update') {
                setCurrentRound(msg.payload);
            }
        });

        return () => ws.close();
    }, []);

    const handleBet = (type: string, value?: number) => {
        const newBet = { type, value, amount: chipAmount };
        setSelectedBets((prev) => [...prev, newBet]);
    };

    const handleConfirmBets = async () => {
        if (!currentRound || selectedBets.length === 0) return;

        for (const bet of selectedBets) {
            await betApi.placeBet({
                round_id: currentRound.id,
                bet_type: bet.type,
                bet_value: bet.value,
                amount: bet.amount,
            });
        }
        setSelectedBets([]);
    };

    const totalBet = selectedBets.reduce((sum, b) => sum + b.amount, 0);

    return (
        <div className="game">
            {/* Header */}
            <header className="game-header">
                <Link to="/" className="back-btn">←</Link>
                <div className="round-info">
                    <span className="round-label">第 {currentRound?.issue_number || '--'} 期</span>
                </div>
                <div className="balance-mini">¥{user?.balance?.toLocaleString() || '0'}</div>
            </header>

            {/* Countdown */}
            <div className="countdown-section">
                <div className="countdown-ring">
                    <svg viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="6"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${(countdown / 60) * 283} 283`}
                            transform="rotate(-90 50 50)"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f5af19" />
                                <stop offset="100%" stopColor="#f12711" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="countdown-text">
                        <span className="countdown-number">{countdown}</span>
                        <span className="countdown-unit">秒</span>
                    </div>
                </div>
            </div>

            {/* Recent Results */}
            <div className="recent-results">
                {recentResults.map((result, i) => (
                    <div key={i} className={`result-ball ${result >= 14 ? 'big' : 'small'}`}>
                        {result}
                    </div>
                ))}
            </div>

            {/* Betting Area */}
            <div className="betting-area">
                {/* Quick Bets */}
                <div className="quick-bets">
                    <button
                        className={`quick-btn big ${selectedBets.some(b => b.type === 'big') ? 'selected' : ''}`}
                        onClick={() => handleBet('big')}
                    >
                        大 (14-27)
                        <span className="odds">×1.95</span>
                    </button>
                    <button
                        className={`quick-btn small ${selectedBets.some(b => b.type === 'small') ? 'selected' : ''}`}
                        onClick={() => handleBet('small')}
                    >
                        小 (0-13)
                        <span className="odds">×1.95</span>
                    </button>
                    <button
                        className={`quick-btn odd ${selectedBets.some(b => b.type === 'odd') ? 'selected' : ''}`}
                        onClick={() => handleBet('odd')}
                    >
                        单
                        <span className="odds">×1.95</span>
                    </button>
                    <button
                        className={`quick-btn even ${selectedBets.some(b => b.type === 'even') ? 'selected' : ''}`}
                        onClick={() => handleBet('even')}
                    >
                        双
                        <span className="odds">×1.95</span>
                    </button>
                </div>

                {/* Number Grid */}
                <div className="numbers-grid">
                    {NUMBERS.map((num) => (
                        <button
                            key={num}
                            className={`number-btn ${selectedBets.some(b => b.type === 'number' && b.value === num) ? 'selected' : ''}`}
                            onClick={() => handleBet('number', num)}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chip Selector */}
            <div className="chip-selector">
                {CHIPS.map((chip) => (
                    <button
                        key={chip}
                        className={`chip ${chipAmount === chip ? 'selected' : ''}`}
                        onClick={() => setChipAmount(chip)}
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Confirm Bar */}
            <div className="confirm-bar">
                <div className="bet-summary">
                    <span className="bet-count">{selectedBets.length} 注</span>
                    <span className="bet-total">¥{totalBet.toLocaleString()}</span>
                </div>
                <button
                    className="confirm-btn"
                    onClick={handleConfirmBets}
                    disabled={selectedBets.length === 0}
                >
                    确认投注
                </button>
            </div>
        </div>
    );
}
