import { Link, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../store/atoms';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
    hideNav?: boolean;
}

const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/lobby', icon: '🎮', label: '游戏' },
    { path: '/game', icon: '🎲', label: '投注' },
    { path: '/history', icon: '📋', label: '记录' },
    { path: '/profile', icon: '👤', label: '我的' },
];

export default function Layout({ children, hideNav = false }: LayoutProps) {
    const location = useLocation();
    const [user] = useAtom(userAtom);

    return (
        <div className="app-layout">
            <main className="app-main">
                {children}
            </main>

            {!hideNav && (
                <>
                    {/* Desktop Sidebar */}
                    <aside className="app-sidebar desktop-only">
                        <div className="sidebar-header">
                            <div className="sidebar-brand">
                                <span className="sidebar-logo">🎰</span>
                                <h1 className="gold-text">PC28</h1>
                            </div>
                        </div>

                        {user && (
                            <div className="sidebar-user">
                                <div className="user-avatar">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user.username}</span>
                                    <span className="user-balance">¥{user.balance.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <nav className="sidebar-nav">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="sidebar-footer">
                            <div className="sidebar-copyright">
                                © 2026 PC28 Game
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Bottom Navigation */}
                    <nav className="bottom-nav mobile-only">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </>
            )}
        </div>
    );
}
