import { useQuery } from '@tanstack/react-query';
import { gameApi } from '../api/client';
import './Rounds.css';

export default function Rounds() {
    const { data: history, isLoading } = useQuery({
        queryKey: ['history'],
        queryFn: () => gameApi.getHistory(),
    });

    return (
        <div className="rounds-page">
            <div className="page-header">
                <h1 className="page-title">轮次管理</h1>
                <div className="header-actions">
                    <button className="btn btn-secondary">导出数据</button>
                    <button className="btn btn-primary">手动开启轮次</button>
                </div>
            </div>

            <div className="filters">
                <input type="date" className="date-picker" />
                <select className="status-filter">
                    <option value="">全部状态</option>
                    <option value="open">开放中</option>
                    <option value="closed">已关闭</option>
                    <option value="settled">已结算</option>
                    <option value="void">已作废</option>
                </select>
            </div>

            <div className="rounds-table">
                {isLoading ? (
                    <div className="loading">加载中...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>期号</th>
                                <th>Keno 数据</th>
                                <th>A</th>
                                <th>B</th>
                                <th>C</th>
                                <th>和值</th>
                                <th>开放时间</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history?.data?.map((round: any) => (
                                <tr key={round.id}>
                                    <td>{round.id}</td>
                                    <td className="issue-number">{round.issue_number}</td>
                                    <td className="keno-data">
                                        {round.keno_data ? (
                                            <span className="keno-preview">
                                                {JSON.parse(round.keno_data).slice(0, 5).join(', ')}...
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>{round.result_a}</td>
                                    <td>{round.result_b}</td>
                                    <td>{round.result_c}</td>
                                    <td className="sum-value">{round.sum}</td>
                                    <td>{new Date(round.open_time).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${round.status}`}>
                                            {round.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" title="查看详情">👁</button>
                                            {round.status === 'open' && (
                                                <button className="btn-icon danger" title="作废">❌</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
