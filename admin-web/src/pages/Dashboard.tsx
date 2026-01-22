import { useQuery } from '@tanstack/react-query';
import { gameApi } from '../api/client';
import './Dashboard.css';

export default function Dashboard() {
    const { data: currentRound } = useQuery({
        queryKey: ['currentRound'],
        queryFn: () => gameApi.getCurrentRound(),
        refetchInterval: 5000,
    });

    const { data: history } = useQuery({
        queryKey: ['history'],
        queryFn: () => gameApi.getHistory(),
    });

    const stats = [
        { label: '今日轮次', value: history?.data?.length || 0, icon: '🎲', color: '#f5af19' },
        { label: '总投注额', value: '¥128,456', icon: '💰', color: '#00d4aa' },
        { label: '活跃用户', value: 1234, icon: '👥', color: '#7c3aed' },
        { label: '平台收益', value: '¥12,345', icon: '📈', color: '#f12711' },
    ];

    return (
        <div className="dashboard">
            <h1 className="page-title">仪表盘</h1>

            {/* Stats Cards */}
            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div className="stat-icon" style={{ background: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Current Round */}
            <div className="section">
                <h2 className="section-title">当前轮次</h2>
                <div className="current-round-card">
                    {currentRound?.data ? (
                        <>
                            <div className="round-info">
                                <span className="round-label">期号</span>
                                <span className="round-value">{currentRound.data.issue_number}</span>
                            </div>
                            <div className="round-info">
                                <span className="round-label">状态</span>
                                <span className={`round-status ${currentRound.data.status}`}>
                                    {currentRound.data.status === 'open' ? '开放投注' : currentRound.data.status}
                                </span>
                            </div>
                        </>
                    ) : (
                        <p className="no-data">暂无开放轮次</p>
                    )}
                </div>
            </div>

            {/* Recent Results */}
            <div className="section">
                <h2 className="section-title">最近开奖</h2>
                <div className="history-table">
                    <table>
                        <thead>
                            <tr>
                                <th>期号</th>
                                <th>结果</th>
                                <th>A</th>
                                <th>B</th>
                                <th>C</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history?.data?.slice(0, 10).map((round: any) => (
                                <tr key={round.id}>
                                    <td>{round.issue_number}</td>
                                    <td className="result-sum">{round.sum}</td>
                                    <td>{round.result_a}</td>
                                    <td>{round.result_b}</td>
                                    <td>{round.result_c}</td>
                                    <td>
                                        <span className={`status-badge ${round.status}`}>
                                            {round.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
