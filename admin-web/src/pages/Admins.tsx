import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../api/client';
import './Admins.css';

interface Admin {
    id: number;
    username: string;
    role: string;
    status: string;
}

export default function Admins() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'admin' });

    const { data: admins, isLoading } = useQuery({
        queryKey: ['admins'],
        queryFn: async () => {
            const res = await adminApi.list();
            return res.data || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof form) => adminApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            setShowModal(false);
            setForm({ username: '', password: '', role: 'admin' });
        },
    });

    const getRoleBadge = (role: string) => {
        const labels: Record<string, { label: string; color: string }> = {
            super_admin: { label: '超级管理员', color: '#f5af19' },
            admin: { label: '管理员', color: '#3b82f6' },
            operator: { label: '运营者', color: '#00d4aa' },
        };
        return labels[role] || { label: role, color: '#888' };
    };

    return (
        <div className="admins-page">
            <div className="page-header">
                <h1 className="page-title">管理员管理</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    添加管理员
                </button>
            </div>

            {isLoading ? (
                <div className="loading">加载中...</div>
            ) : (
                <div className="admins-table-wrapper">
                    <table className="admins-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>用户名</th>
                                <th>角色</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins?.map((admin: Admin) => {
                                const badge = getRoleBadge(admin.role);
                                return (
                                    <tr key={admin.id}>
                                        <td>{admin.id}</td>
                                        <td className="username">{admin.username}</td>
                                        <td>
                                            <span
                                                className="role-badge"
                                                style={{ background: `${badge.color}20`, color: badge.color }}
                                            >
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${admin.status}`}>
                                                {admin.status === 'active' ? '启用' : '禁用'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-btn">编辑</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>添加管理员</h2>
                        <div className="form-group">
                            <label>用户名</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                placeholder="请输入用户名"
                            />
                        </div>
                        <div className="form-group">
                            <label>密码</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="请输入密码"
                            />
                        </div>
                        <div className="form-group">
                            <label>角色</label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="admin">管理员</option>
                                <option value="operator">运营者</option>
                                <option value="super_admin">超级管理员</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                取消
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => createMutation.mutate(form)}
                            >
                                创建
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
