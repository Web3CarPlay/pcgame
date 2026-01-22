import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { playerUserAtom, playerTokenAtom } from '../store/atoms';
import { playerApi, authApi } from '../api/client';
import './Profile.css';

export default function Profile() {
    const user = useAtomValue(playerUserAtom);
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
            {/* User Info Hero Section */}
            <section className="profile-hero">
                <div className="profile-hero-bg"></div>
                <div className="profile-hero-content">
                    <div className="user-avatar-wrapper">
                        <div className="user-avatar">
                            {user?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="user-level">VIP</div>
                    </div>
                    <div className="user-details">
                        <h1 className="user-name">{user?.username || '未登录'}</h1>
                        <div className="user-balance-display">
                            <span className="balance-label">账户余额</span>
                            <span className="balance-amount">¥{(user?.balance || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="profile-content">
                {/* Invite Card */}
                <section className="invite-card">
                    <div className="invite-card-header">
                        <span className="invite-icon">🎁</span>
                        <div className="invite-header-text">
                            <h2>邀请好友赚佣金</h2>
                            <p>分享链接，好友注册后自动绑定，享受推广返佣</p>
                        </div>
                    </div>

                    <div className="invite-code-display">
                        <div className="invite-code-label">我的专属邀请码</div>
                        <div className="invite-code-value">{inviteCode || '加载中...'}</div>
                    </div>

                    <div className="invite-link-box">
                        <div className="invite-link-label">
                            <span className="link-icon">🔗</span>
                            <span>专属推广链接</span>
                        </div>
                        <div className="invite-link-content">
                            <div className="invite-link-text">{inviteUrl || '加载中...'}</div>
                            <button
                                className={`copy-btn ${copied ? 'copied' : ''}`}
                                onClick={handleCopy}
                            >
                                {copied ? '✓ 已复制' : '复制链接'}
                            </button>
                        </div>
                    </div>

                    <div className="invite-stats-row">
                        <div className="invite-stat">
                            <span className="stat-number">{referrals.length}</span>
                            <span className="stat-label">已邀请人数</span>
                        </div>
                        <div className="invite-stat">
                            <span className="stat-number">{referrals.filter(r => r.is_active).length || 0}</span>
                            <span className="stat-label">活跃用户</span>
                        </div>
                        <div className="invite-stat highlight">
                            <span className="stat-number">10%</span>
                            <span className="stat-label">返佣比例</span>
                        </div>
                    </div>
                </section>

                {/* Quick Menu */}
                <section className="quick-menu">
                    <Link to="/stats" className="quick-menu-item featured">
                        <div className="menu-item-icon">📊</div>
                        <div className="menu-item-content">
                            <span className="menu-item-title">推广统计</span>
                            <span className="menu-item-desc">查看详细收益数据</span>
                        </div>
                        {referrals.length > 0 && (
                            <span className="menu-item-badge">{referrals.length}人</span>
                        )}
                        <span className="menu-item-arrow">›</span>
                    </Link>

                    <Link to="/history" className="quick-menu-item">
                        <div className="menu-item-icon">📜</div>
                        <div className="menu-item-content">
                            <span className="menu-item-title">投注记录</span>
                            <span className="menu-item-desc">历史投注与中奖详情</span>
                        </div>
                        <span className="menu-item-arrow">›</span>
                    </Link>

                    <div className="quick-menu-item logout" onClick={handleLogout}>
                        <div className="menu-item-icon">🚪</div>
                        <div className="menu-item-content">
                            <span className="menu-item-title">退出登录</span>
                            <span className="menu-item-desc">切换其他账号</span>
                        </div>
                        <span className="menu-item-arrow">›</span>
                    </div>
                </section>
            </div>
        </div>
    );
}
