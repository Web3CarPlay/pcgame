import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { playerUserAtom, playerTokenAtom } from '../store/atoms';
import { playerApi, authApi } from '../api/client';
import './Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useAtom(playerUserAtom);
    const token = useAtomValue(playerTokenAtom);
    const [inviteCode, setInviteCode] = useState('');
    const [inviteUrl, setInviteUrl] = useState('');
    const [referrals, setReferrals] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!token) return;

        // Fetch invite code
        playerApi.getInviteCode().then(res => {
            if (res.data) {
                setInviteCode(res.data.invite_code);
                setInviteUrl(res.data.invite_url);
            }
        });

        // Fetch referrals
        playerApi.getReferrals().then(res => {
            if (res.data) {
                setReferrals(res.data);
            }
        });
    }, [token]);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        authApi.logout();
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <h1>我的</h1>
            </header>

            <div className="user-card">
                <div className="avatar">
                    {user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="user-info">
                    <h2>{user?.username || '未登录'}</h2>
                    <div className="balance">
                        <span className="label">余额</span>
                        <span className="value">¥{(user?.balance || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="invite-section">
                <h3>邀请好友</h3>
                <p className="invite-desc">分享您的邀请链接，好友注册后自动绑定</p>

                <div className="invite-code-box">
                    <span className="code-label">邀请码</span>
                    <span className="code">{inviteCode || '---'}</span>
                </div>

                <div className="invite-url-box">
                    <input type="text" readOnly value={inviteUrl} />
                    <button onClick={handleCopy}>
                        {copied ? '已复制' : '复制'}
                    </button>
                </div>
            </div>

            {referrals.length > 0 && (
                <div className="referrals-section">
                    <h3>我的推荐 ({referrals.length}人)</h3>
                    <div className="referrals-list">
                        {referrals.map((r: any) => (
                            <div key={r.id} className="referral-item">
                                <span className="referral-avatar">
                                    {r.username?.charAt(0).toUpperCase()}
                                </span>
                                <span className="referral-name">{r.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="menu-section">
                <Link to="/history" className="menu-item">
                    <span className="menu-icon">📜</span>
                    <span className="menu-label">投注记录</span>
                    <span className="menu-arrow">›</span>
                </Link>
                <div className="menu-item" onClick={handleLogout}>
                    <span className="menu-icon">🚪</span>
                    <span className="menu-label">退出登录</span>
                    <span className="menu-arrow">›</span>
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
                <Link to="/profile" className="nav-item active">
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">我的</span>
                </Link>
            </nav>
        </div>
    );
}
