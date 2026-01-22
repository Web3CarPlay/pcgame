import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { playerApi } from '../api/client';
import type { ReferralUser, ReferralStats, EarningsSummary, DailyEarning } from '../api/client';
import './Stats.css';

type DateRange = 'today' | 'week' | 'month' | 'all';

export default function Stats() {
    const [inviteCode, setInviteCode] = useState('');
    const [inviteUrl, setInviteUrl] = useState('');
    const [referrals, setReferrals] = useState<ReferralUser[]>([]);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>('all');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadData();
    }, [dateRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [inviteRes, referralsRes, statsRes, earningsRes] = await Promise.all([
                playerApi.getInviteCode(),
                playerApi.getReferrals(),
                playerApi.getReferralStats(),
                playerApi.getEarnings(getDateRange(dateRange).start, getDateRange(dateRange).end),
            ]);

            if (inviteRes.data) {
                setInviteCode(inviteRes.data.invite_code);
                setInviteUrl(inviteRes.data.invite_url);
            }
            if (referralsRes.data) setReferrals(referralsRes.data);
            if (statsRes.data) setStats(statsRes.data);
            if (earningsRes.data) setEarnings(earningsRes.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
        setLoading(false);
    };

    const getDateRange = (range: DateRange) => {
        const now = new Date();
        const end = now.toISOString().split('T')[0];
        let start = end;

        switch (range) {
            case 'today':
                start = end;
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                start = weekAgo.toISOString().split('T')[0];
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                start = monthAgo.toISOString().split('T')[0];
                break;
            case 'all':
                return { start: undefined, end: undefined };
        }
        return { start, end };
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const formatMoney = (amount: number) => {
        return amount >= 0 ? `¥${amount.toLocaleString()}` : `-¥${Math.abs(amount).toLocaleString()}`;
    };

    return (
        <div className="stats-page">
            <header className="stats-header">
                <Link to="/profile" className="back-btn">←</Link>
                <h1>推广统计</h1>
            </header>

            <div className="stats-content">
                {/* QR Code Section */}
                <div className="qr-section glass-card-gold">
                    <div className="qr-container">
                        <QRCodeSVG
                            value={inviteUrl || 'https://example.com'}
                            size={160}
                            level="H"
                            includeMargin={false}
                            bgColor="#ffffff"
                            fgColor="#0a0a0f"
                        />
                    </div>
                    <div className="invite-code-display">
                        邀请码: <span className="gold-text">{inviteCode || '---'}</span>
                    </div>
                    <div className="qr-actions">
                        <button className="gold-button" onClick={handleCopy}>
                            {copied ? '✓ 已复制' : '复制链接'}
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="summary-grid">
                    <div className="summary-card highlight">
                        <div className="icon">👥</div>
                        <div className="value stat-value">{stats?.total_referrals || 0}</div>
                        <div className="label">下线人数</div>
                    </div>
                    <div className="summary-card highlight">
                        <div className="icon">🔥</div>
                        <div className="value stat-value">{stats?.active_referrals || 0}</div>
                        <div className="label">活跃下线</div>
                    </div>
                    <div className="summary-card">
                        <div className="icon">📊</div>
                        <div className="value stat-value">{formatMoney(stats?.total_customer_loss || 0)}</div>
                        <div className="label">总客损</div>
                    </div>
                    <div className="summary-card">
                        <div className="icon">💎</div>
                        <div className="value stat-value">{formatMoney(stats?.total_commission || 0)}</div>
                        <div className="label">总佣金</div>
                    </div>
                </div>

                {/* Commission Card */}
                <div className="commission-card">
                    <div className="title">我的推广收益</div>
                    <div className="amount">{formatMoney(earnings?.total_earnings || 0)}</div>
                    <div className="rate">佣金比例 {((stats?.commission_rate || 0) * 100).toFixed(1)}%</div>
                </div>

                {/* Date Filter */}
                <div className="date-filter">
                    <button
                        className={dateRange === 'today' ? 'active' : ''}
                        onClick={() => setDateRange('today')}
                    >今日</button>
                    <button
                        className={dateRange === 'week' ? 'active' : ''}
                        onClick={() => setDateRange('week')}
                    >近7天</button>
                    <button
                        className={dateRange === 'month' ? 'active' : ''}
                        onClick={() => setDateRange('month')}
                    >近30天</button>
                    <button
                        className={dateRange === 'all' ? 'active' : ''}
                        onClick={() => setDateRange('all')}
                    >全部</button>
                </div>

                {/* Daily Earnings */}
                {earnings?.daily_earnings && earnings.daily_earnings.length > 0 && (
                    <div className="daily-earnings">
                        <div className="section-title">
                            <h2>📅 每日收益</h2>
                        </div>
                        {earnings.daily_earnings.map((day: DailyEarning) => (
                            <div key={day.date} className="daily-item">
                                <span className="daily-date">{formatDate(day.date)}</span>
                                <span className="daily-commission">+{formatMoney(day.commission)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Referral List */}
                <div className="referral-list">
                    <div className="section-title">
                        <h2>👤 下线明细</h2>
                        <span className="count">{referrals.length}</span>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <div className="icon shimmer">⏳</div>
                            <p>加载中...</p>
                        </div>
                    ) : referrals.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">🔗</div>
                            <p>暂无下线用户<br />分享您的邀请链接开始推广</p>
                        </div>
                    ) : (
                        referrals.map((user) => (
                            <div key={user.id} className="referral-item">
                                <div className="referral-item-header">
                                    <div className="referral-avatar">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="referral-info">
                                        <div className="referral-name">{user.username}</div>
                                        <div className="referral-date">
                                            加入于 {formatDate(user.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <div className="referral-stats">
                                    <div className="referral-stat">
                                        <div className="stat-label">投注额</div>
                                        <div className="stat-value">{formatMoney(user.total_bet)}</div>
                                    </div>
                                    <div className="referral-stat">
                                        <div className="stat-label">中奖额</div>
                                        <div className="stat-value win">{formatMoney(user.total_win)}</div>
                                    </div>
                                    <div className="referral-stat">
                                        <div className="stat-label">客损</div>
                                        <div className="stat-value loss">{formatMoney(user.net_loss)}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <nav className="bottom-nav">
                <Link to="/" className="nav-item">
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">首页</span>
                </Link>
                <Link to="/game" className="nav-item">
                    <span className="nav-icon">🎲</span>
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
