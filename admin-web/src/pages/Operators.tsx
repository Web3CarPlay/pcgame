import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { isSuperAdminAtom } from '../store/atoms';
import { operatorApi } from '../api/client';
import './Operators.css';

interface Operator {
    id: number;
    code: string;
    name: string;
    commission: number;
    status: string;
    user_count: number;
    created_by?: { username: string };
}

export default function Operators() {
    const isSuperAdmin = useAtomValue(isSuperAdminAtom);
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ code: '', name: '', commission: 0 });

    const { data: operators, isLoading } = useQuery({
        queryKey: ['operators'],
        queryFn: async () => {
            const res = await operatorApi.list();
            return res.data || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof form) => operatorApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operators'] });
            setShowModal(false);
            setForm({ code: '', name: '', commission: 0 });
        },
    });

    const getInviteUrl = (code: string) => {
        return `${window.location.origin.replace('5173', '5174')}?op=${code}`;
    };

    return (
        <div className="operators-page">
            <div className="page-header">
                <h1 className="page-title">运营者管理</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    添加运营者
                </button>
            </div>

            <div className="operators-grid">
                {isLoading ? (
                    <div className="loading">加载中...</div>
                ) : operators?.length === 0 ? (
                    <div className="empty">
                        <span className="empty-icon">🏢</span>
                        <p>暂无运营者</p>
                    </div>
                ) : (
                    operators?.map((op: Operator) => (
                        <div key={op.id} className="operator-card">
                            <div className="operator-header">
                                <span className="operator-code">{op.code}</span>
                                <span className={`status-badge ${op.status}`}>{op.status}</span>
                            </div>
                            <h3 className="operator-name">{op.name}</h3>

                            {/* Super admin can see who created this operator */}
                            {isSuperAdmin && op.created_by && (
                                <div className="created-by">
                                    创建者: {op.created_by.username}
                                </div>
                            )}

                            <div className="operator-stats">
                                <div className="stat">
                                    <span className="stat-label">用户数</span>
                                    <span className="stat-value">{op.user_count}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">佣金</span>
                                    <span className="stat-value">{(op.commission * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="invite-url">
                                <span className="url-label">邀请链接</span>
                                <input type="text" readOnly value={getInviteUrl(op.code)} />
                                <button
                                    className="copy-btn"
                                    onClick={() => navigator.clipboard.writeText(getInviteUrl(op.code))}
                                >
                                    复制
                                </button>
                            </div>
                            <div className="card-actions">
                                <button className="action-btn edit">编辑</button>
                                <button className="action-btn delete">删除</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>添加运营者</h2>
                        <div className="form-group">
                            <label>代码</label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                placeholder="如: op001"
                            />
                        </div>
                        <div className="form-group">
                            <label>名称</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="运营者名称"
                            />
                        </div>
                        <div className="form-group">
                            <label>佣金比例</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.commission}
                                onChange={(e) => setForm({ ...form, commission: parseFloat(e.target.value) || 0 })}
                                placeholder="0.05 = 5%"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                取消
                            </button>
                            <button className="btn btn-primary" onClick={() => createMutation.mutate(form)}>
                                创建
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
