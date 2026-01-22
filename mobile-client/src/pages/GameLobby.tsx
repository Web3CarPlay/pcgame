import { Link } from 'react-router-dom';
import pc28Banner from '../assets/pc28_banner.png';
import './GameLobby.css';

// Game configuration - extensible for future games
interface GameInfo {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    icon: string;
    banner: string;
    route: string;
    status: 'live' | 'coming-soon' | 'maintenance';
    featured?: boolean;
    tags: string[];
    stats: {
        label: string;
        value: string;
    }[];
}

// Games list - add more games here in the future
const GAMES: GameInfo[] = [
    {
        id: 'pc28',
        name: 'PC28',
        subtitle: '经典竞猜',
        description: 'PC28是一款基于Keno彩票的经典数字竞猜游戏。通过预测三个数字之和(0-27)来赢取奖励。支持大小、单双、特定数字等多种玩法，每分钟一期，快速开奖！',
        icon: '🎲',
        banner: pc28Banner,
        route: '/game',
        status: 'live',
        featured: true,
        tags: ['热门', '快速开奖', '高赔率'],
        stats: [
            { label: '开奖间隔', value: '1分钟' },
            { label: '最高赔率', value: '9.8x' },
            { label: '最低投注', value: '¥10' },
        ],
    },
    // Future games can be added here
    // {
    //     id: 'dice',
    //     name: '骰宝',
    //     subtitle: '传统骰子游戏',
    //     description: '经典骰宝玩法，预测骰子点数组合...',
    //     icon: '🎯',
    //     banner: diceBanner,
    //     route: '/dice',
    //     status: 'coming-soon',
    //     tags: ['即将上线'],
    //     stats: [...],
    // },
];

export default function GameLobby() {
    return (
        <div className="lobby-page">
            {/* Header with Background */}
            <header className="lobby-header">
                <div className="lobby-header-bg"></div>
                <div className="lobby-header-overlay"></div>
                <div className="lobby-header-content">
                    <h1>🎰 游戏大厅</h1>
                    <p>精选优质游戏，畅享娱乐时光</p>
                </div>
            </header>

            {/* Content */}
            <div className="lobby-content">
                <div className="section-header">
                    <h2>🔥 热门游戏 <span className="badge">{GAMES.filter(g => g.status === 'live').length}</span></h2>
                </div>

                <div className="games-grid">
                    {GAMES.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <Link to="/" className="nav-item">
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">首页</span>
                </Link>
                <Link to="/lobby" className="nav-item active">
                    <span className="nav-icon">🎮</span>
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

// Game Card Component
function GameCard({ game }: { game: GameInfo }) {
    const isLive = game.status === 'live';
    const isComingSoon = game.status === 'coming-soon';

    const cardContent = (
        <div className={`game-card ${game.featured ? 'featured' : ''} ${isComingSoon ? 'coming-soon' : ''}`}>
            {/* Banner */}
            <div className="game-card-banner">
                <img src={game.banner} alt={game.name} />
                <div className="game-card-banner-overlay"></div>
                <div className={`game-status ${isComingSoon ? 'coming-soon' : ''}`}>
                    {isLive && <span className="dot"></span>}
                    {isLive ? '进行中' : '即将上线'}
                </div>
            </div>

            {/* Content */}
            <div className="game-card-content">
                <div className="game-card-header">
                    <div className="game-icon">{game.icon}</div>
                    <div className="game-title-group">
                        <h3>{game.name}</h3>
                        <span className="game-subtitle">{game.subtitle}</span>
                    </div>
                </div>

                <p className="game-description">{game.description}</p>

                {/* Tags */}
                <div className="game-tags">
                    {game.tags.map((tag, i) => (
                        <span key={i} className={`game-tag ${i === 0 && isLive ? 'highlight' : ''}`}>
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Stats */}
                <div className="game-stats">
                    {game.stats.map((stat, i) => (
                        <div key={i} className="game-stat">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Play Button */}
                <button className={`play-now-btn ${!isLive ? 'disabled' : ''}`}>
                    {isLive ? (
                        <>
                            <span>🚀</span>
                            <span>立即游戏</span>
                        </>
                    ) : (
                        <span>敬请期待</span>
                    )}
                </button>
            </div>
        </div>
    );

    // Wrap with Link only if game is live
    if (isLive) {
        return <Link to={game.route} style={{ textDecoration: 'none', color: 'inherit' }}>{cardContent}</Link>;
    }
    return cardContent;
}
