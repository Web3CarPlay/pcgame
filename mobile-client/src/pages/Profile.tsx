import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../store/atoms';
import './Profile.css';

export default function Profile() {
    const [user] = useAtom(userAtom);

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
