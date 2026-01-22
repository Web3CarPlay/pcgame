import { Outlet, NavLink } from 'react-router-dom';
import { useAtom } from 'jotai';
import { sidebarOpenAtom } from '../store/atoms';
import './Layout.css';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

    const navItems = [
        { path: '/', icon: '📊', label: '仪表盘' },
        { path: '/rounds', icon: '🎲', label: '轮次管理' },
        { path: '/users', icon: '👥', label: '用户管理' },
        { path: '/settings', icon: '⚙️', label: '设置' },
    ];

    return (
        <div className="layout">
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <h1 className="logo">🎰 PC28 Admin</h1>
                    <button
                        className="toggle-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>
                <nav className="nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            end={item.path === '/'}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
