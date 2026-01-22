import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { sidebarOpenAtom, adminUserAtom, tokenAtom, isSuperAdminAtom } from '../store/atoms';
import './Layout.css';

export default function Layout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
    const adminUser = useAtomValue(adminUserAtom);
    const isSuperAdmin = useAtomValue(isSuperAdminAtom);
    const setToken = useSetAtom(tokenAtom);
    const setAdminUser = useSetAtom(adminUserAtom);

    const handleLogout = () => {
        setToken(null);
        setAdminUser(null);
        navigate('/login');
    };

    // Menu items based on role
    const navItems = [
        { path: '/', icon: '📊', label: '仪表盘', roles: ['super_admin', 'admin', 'operator'] },
        { path: '/rounds', icon: '🎲', label: '轮次管理', roles: ['super_admin', 'admin'] },
        { path: '/users', icon: '👥', label: '用户管理', roles: ['super_admin', 'admin', 'operator'] },
        { path: '/operators', icon: '🏢', label: '运营者管理', roles: ['super_admin', 'admin'] },
        { path: '/admins', icon: '🔑', label: '管理员管理', roles: ['super_admin'] },
        { path: '/settings', icon: '⚙️', label: '设置', roles: ['super_admin'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(adminUser?.role || '')
    );

    const getRoleBadge = (role: string) => {
        const labels: Record<string, string> = {
            super_admin: '超级管理员',
            admin: '管理员',
            operator: '运营者',
        };
        return labels[role] || role;
    };

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

                {sidebarOpen && adminUser && (
                    <div className="user-info">
                        <span className="username">{adminUser.username}</span>
                        <span className="role-badge">{getRoleBadge(adminUser.role)}</span>
                    </div>
                )}

                <nav className="nav">
                    {filteredNavItems.map((item) => (
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

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span>
                        {sidebarOpen && <span className="nav-label">退出登录</span>}
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
