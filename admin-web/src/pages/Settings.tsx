import { useState } from 'react';
import './Settings.css';

export default function Settings() {
    const [settings, setSettings] = useState({
        roundDuration: 60,
        bettingWindow: 55,
        maxBetAmount: 10000,
        minBetAmount: 10,
        enableMockData: true,
        kenoApiUrl: '',
        kenoApiKey: '',
    });

    const handleSave = () => {
        // TODO: Save settings to backend
        alert('设置已保存');
    };

    return (
        <div className="settings-page">
            <h1 className="page-title">系统设置</h1>

            <div className="settings-sections">
                {/* Game Settings */}
                <section className="settings-section">
                    <h2 className="section-title">游戏设置</h2>
                    <div className="settings-grid">
                        <div className="setting-item">
                            <label>轮次时长 (秒)</label>
                            <input
                                type="number"
                                value={settings.roundDuration}
                                onChange={(e) => setSettings({ ...settings, roundDuration: +e.target.value })}
                            />
                        </div>
                        <div className="setting-item">
                            <label>投注窗口 (秒)</label>
                            <input
                                type="number"
                                value={settings.bettingWindow}
                                onChange={(e) => setSettings({ ...settings, bettingWindow: +e.target.value })}
                            />
                        </div>
                        <div className="setting-item">
                            <label>最大投注额</label>
                            <input
                                type="number"
                                value={settings.maxBetAmount}
                                onChange={(e) => setSettings({ ...settings, maxBetAmount: +e.target.value })}
                            />
                        </div>
                        <div className="setting-item">
                            <label>最小投注额</label>
                            <input
                                type="number"
                                value={settings.minBetAmount}
                                onChange={(e) => setSettings({ ...settings, minBetAmount: +e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Data Source Settings */}
                <section className="settings-section">
                    <h2 className="section-title">数据源设置</h2>
                    <div className="settings-grid">
                        <div className="setting-item toggle">
                            <label>使用模拟数据</label>
                            <button
                                className={`toggle-btn ${settings.enableMockData ? 'active' : ''}`}
                                onClick={() => setSettings({ ...settings, enableMockData: !settings.enableMockData })}
                            >
                                {settings.enableMockData ? '开启' : '关闭'}
                            </button>
                        </div>
                        {!settings.enableMockData && (
                            <>
                                <div className="setting-item full-width">
                                    <label>Keno API URL</label>
                                    <input
                                        type="text"
                                        value={settings.kenoApiUrl}
                                        onChange={(e) => setSettings({ ...settings, kenoApiUrl: e.target.value })}
                                        placeholder="https://api.example.com/keno"
                                    />
                                </div>
                                <div className="setting-item full-width">
                                    <label>API Key</label>
                                    <input
                                        type="password"
                                        value={settings.kenoApiKey}
                                        onChange={(e) => setSettings({ ...settings, kenoApiKey: e.target.value })}
                                        placeholder="Your API key"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Odds Settings */}
                <section className="settings-section">
                    <h2 className="section-title">赔率设置</h2>
                    <div className="odds-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>玩法</th>
                                    <th>当前赔率</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>大 (14-27)</td>
                                    <td>1.95</td>
                                    <td><button className="btn-edit">编辑</button></td>
                                </tr>
                                <tr>
                                    <td>小 (0-13)</td>
                                    <td>1.95</td>
                                    <td><button className="btn-edit">编辑</button></td>
                                </tr>
                                <tr>
                                    <td>单</td>
                                    <td>1.95</td>
                                    <td><button className="btn-edit">编辑</button></td>
                                </tr>
                                <tr>
                                    <td>双</td>
                                    <td>1.95</td>
                                    <td><button className="btn-edit">编辑</button></td>
                                </tr>
                                <tr>
                                    <td>数字 (0-27)</td>
                                    <td>9.8</td>
                                    <td><button className="btn-edit">编辑</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <div className="settings-footer">
                <button className="btn btn-primary" onClick={handleSave}>
                    保存设置
                </button>
            </div>
        </div>
    );
}
