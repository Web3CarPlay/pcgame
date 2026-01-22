import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import './Users.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

interface User {
    id: number;
    username: string;
    balance: number;
    role: string;
    operator_id?: number;
    referrer_id?: number;
    invite_code: string;
    invite_count: number;
    operator?: { code: string; name: string };
    referrer?: { username: string };
}

async function fetchUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/api/v1/users`);
    return res.json();
}

export default function Users() {
    const [search, setSearch] = useState('');

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const filteredUsers = users?.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="users-page">
            <div className="page-header">
                <h1 className="page-title">用户管理</h1>
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

            {isLoading ? (
                <div className="loading">加载中...</div>
            ) : (
                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>用户名</th>
                                <th>余额</th>
                                <th>角色</th>
                                <th>所属运营者</th>
                                <th>邀请人</th>
                                <th>邀请码</th>
                                <th>邀请人数</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td className="username">{user.username}</td>
                                    <td className="balance">¥{user.balance.toLocaleString()}</td>
                                    <td>
                                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                                    </td>
                                    <td>
                                        {user.operator ? (
                                            <span className="operator-tag">
                                                {user.operator.name} ({user.operator.code})
                                            </span>
                                        ) : (
                                            <span className="no-data">-</span>
                                        )}
                                    </td>
                                    <td>
                                        {user.referrer ? (
                                            <span className="referrer-tag">{user.referrer.username}</span>
                                        ) : (
                                            <span className="no-data">-</span>
                                        )}
                                    </td>
                                    <td>
                                        <code className="invite-code">{user.invite_code}</code>
                                    </td>
                                    <td className="invite-count">{user.invite_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
