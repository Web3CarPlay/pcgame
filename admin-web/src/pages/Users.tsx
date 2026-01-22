import { useState } from 'react';
import './Users.css';

interface User {
    id: number;
    username: string;
    balance: number;
    role: string;
    created_at: string;
}

// Mock data for demonstration
const mockUsers: User[] = [
    { id: 1, username: 'player001', balance: 10000, role: 'user', created_at: '2025-01-20' },
    { id: 2, username: 'player002', balance: 5600, role: 'user', created_at: '2025-01-19' },
    { id: 3, username: 'vip_user', balance: 88888, role: 'vip', created_at: '2025-01-15' },
    { id: 4, username: 'admin01', balance: 0, role: 'admin', created_at: '2025-01-01' },
];

export default function Users() {
    const [search, setSearch] = useState('');
    const [users] = useState<User[]>(mockUsers);

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="users-page">
            <div className="page-header">
                <h1 className="page-title">用户管理</h1>
                <button className="btn btn-primary">添加用户</button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="搜索用户名..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="users-grid">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="user-card">
                        <div className="user-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <h3 className="user-name">{user.username}</h3>
                            <span className={`role-badge ${user.role}`}>{user.role}</span>
                        </div>
                        <div className="user-balance">
                            <span className="balance-label">余额</span>
                            <span className="balance-value">¥{user.balance.toLocaleString()}</span>
                        </div>
                        <div className="user-actions">
                            <button className="btn-sm">查看投注</button>
                            <button className="btn-sm">编辑</button>
                            <button className="btn-sm danger">禁用</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
