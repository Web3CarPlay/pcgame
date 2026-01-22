import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../store/atoms';
import './Profile.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

interface InviteInfo {
    invite_code: string;
    invite_url: string;
}

interface Referral {
    id: number;
    username: string;
    balance: number;
}

export default function Profile() {
    const [user] = useAtom(userAtom);
    const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Fetch invite code
        fetch(`${API_BASE}/api/v1/users/invite-code`)
            .then(res => res.json())
            .then(setInviteInfo)
            .catch(console.error);

        // Fetch referrals
        fetch(`${API_BASE}/api/v1/users/referrals`)
            .then(res => res.json())
            .then(setReferrals)
            .catch(console.error);
    }, []);

    const handleCopyLink = () => {
        if (inviteInfo?.invite_url) {
            navigator.clipboard.writeText(inviteInfo.invite_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const menuItems = [
        { icon: '💰', label: '充值', path: '/deposit' },
        { icon: '💸', label: '提现', path: '/withdraw' },
        { icon: '📊', label: '账单明细', path: '/transactions' },
        { icon: '🔒', label: '修改密码', path: '/password' },
        { icon: '❓', label: '帮助中心', path: '/help' },
        { icon: '📞', label: '联系客服', path: '/support' },
    ];

    return (
        <div className="profile">
            <header className="profile-header">
                <div className="user-card">
                    <div className="avatar">
                        {user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="user-info">
                        <h2>{user?.username || '游客'}</h2>
                        <span className="user-id">ID: {user?.id || '--'}</span>
                    </div>
                </div>
                <div className="balance-card">
                    <div className="balance-row">
                        <span className="balance-label">账户余额</span>
                        <span className="balance-value">¥{user?.balance?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="balance-actions">
                        <button className="action-btn deposit">充值</button>
                        <button className="action-btn withdraw">提现</button>
                    </div>
                </div>
            </header>

            <div className="profile-content">
                {/* Invite Section */}
                <div className="invite-section">
                    <h3 className="section-title">邀请好友</h3>
                    <div className="invite-card">
                        <div className="invite-stats">
                            <div className="invite-stat">
                                <span className="stat-value">{referrals.length}</span>
                                <span className="stat-label">已邀请</span>
                            </div>
                            <div className="invite-stat">
                                <span className="stat-value">{inviteInfo?.invite_code || '--'}</span>
                                <span className="stat-label">邀请码</span>
                            </div>
                        </div>
                        <button className="invite-btn" onClick={handleCopyLink}>
                            {copied ? '✓ 已复制' : '复制邀请链接'}
                        </button>
                    </div>

                    {referrals.length > 0 && (
                        <div className="referrals-list">
                            <h4>我的邀请</h4>
                            {referrals.slice(0, 5).map((ref) => (
                                <div key={ref.id} className="referral-item">
                                    <span className="referral-name">{ref.username}</span>
                                    <span className="referral-balance">¥{ref.balance.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="menu-section">
                    {menuItems.map((item) => (
                        <Link key={item.label} to={item.path} className="menu-item">
                            <span className="menu-icon">{item.icon}</span>
                            <span className="menu-label">{item.label}</span>
                            <span className="menu-arrow">›</span>
                        </Link>
                    ))}
                </div>

                <button className="logout-btn">退出登录</button>
            </div>

            <nav className="bottom-nav">
                <Link to="/" className="nav-item">
                    <span className="nav-icon">🏠</span>
                    <span>首页</span>
                </Link>
                <Link to="/game" className="nav-item">
                    <span className="nav-icon">🎲</span>
                    <span>投注</span>
                </Link>
                <Link to="/history" className="nav-item">
                    <span className="nav-icon">📋</span>
                    <span>记录</span>
                </Link>
                <Link to="/profile" className="nav-item active">
                    <span className="nav-icon">👤</span>
                    <span>我的</span>
                </Link>
            </nav>
        </div>
    );
}
