import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../store/atoms';
import './Home.css';

export default function Home() {
    const [user] = useAtom(userAtom);

    return (
        <div className="home">
            <header className="home-header">
                <div className="brand">
                    <span className="logo">🎰</span>
                    <h1>PC28</h1>
                </div>
                {user && (
                    <div className="balance">
                        <span className="balance-label">余额</span>
                        <span className="balance-value">¥{user.balance.toLocaleString()}</span>
                    </div>
                )}
            </header>

            <main className="home-content">
                <div className="hero">
                    <div className="hero-glow"></div>
                    <h2>欢迎来到 PC28</h2>
                    <p>经典竞猜游戏，大奖等你来拿！</p>
                </div>

                <Link to="/lobby" className="play-btn">
                    <span className="play-icon">🎮</span>
                    <span>进入游戏大厅</span>
                </Link>

                <div className="features">
                    <div className="feature-card">
                        <span className="feature-icon">⚡</span>
                        <h3>快速开奖</h3>
                        <p>每分钟一期</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">💰</span>
                        <h3>高额赔率</h3>
                        <p>最高 9.8 倍</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🔒</span>
                        <h3>安全可靠</h3>
                        <p>公平公正</p>
                    </div>
                </div>
            </main>

            <nav className="bottom-nav">
                <Link to="/" className="nav-item active">
                    <span className="nav-icon">🏠</span>
                    <span>首页</span>
                </Link>
                <Link to="/lobby" className="nav-item">
                    <span className="nav-icon">🎮</span>
                    <span>游戏</span>
                </Link>
                <Link to="/history" className="nav-item">
                    <span className="nav-icon">📋</span>
                    <span>记录</span>
                </Link>
                <Link to="/profile" className="nav-item">
                    <span className="nav-icon">👤</span>
                    <span>我的</span>
                </Link>
            </nav>
        </div>
    );
}
