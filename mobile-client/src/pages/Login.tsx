import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { playerTokenAtom, playerUserAtom } from '../store/atoms';
import { authApi } from '../api/client';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const setToken = useSetAtom(playerTokenAtom);
    const setUser = useSetAtom(playerUserAtom);

    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get operator/referrer codes from localStorage
    const [operatorCode, setOperatorCode] = useState('');
    const [referrerCode, setReferrerCode] = useState('');

    useEffect(() => {
        const op = localStorage.getItem('op_code');
        const ref = localStorage.getItem('ref_code');
        if (op) setOperatorCode(op);
        if (ref) setReferrerCode(ref);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = isLogin
                ? await authApi.login(username, password)
                : await authApi.register(username, password, operatorCode, referrerCode);

            if (res.error) {
                setError(res.error);
                return;
            }

            if (res.data) {
                setToken(String(res.data.token));
                setUser(res.data.user);
                navigate('/');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-logo">🎰</span>
                    <h1>PC28 Game</h1>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        登录
                    </button>
                    <button
                        className={`tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        注册
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="用户名"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="密码"
                            required
                        />
                    </div>

                    {!isLogin && operatorCode && (
                        <div className="promo-tag">运营商: {operatorCode}</div>
                    )}

                    {!isLogin && referrerCode && (
                        <div className="promo-tag">邀请码: {referrerCode}</div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
                    </button>
                </form>
            </div>
        </div>
    );
}
