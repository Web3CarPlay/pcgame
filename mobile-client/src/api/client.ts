const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:8080';

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

// Token management
function getToken(): string | null {
    const stored = localStorage.getItem('player_token');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return stored;
        }
    }
    return null;
}

function setToken(token: string | null) {
    if (token) {
        localStorage.setItem('player_token', JSON.stringify(token));
    } else {
        localStorage.removeItem('player_token');
    }
}

function clearAuth() {
    localStorage.removeItem('player_token');
    localStorage.removeItem('player_user');
}

// Request helper with auth
async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
): Promise<ApiResponse<T>> {
    try {
        const token = getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else if (requireAuth) {
            // Redirect to login if token required but missing
            window.location.href = '/login';
            return { error: 'Not authenticated' };
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            clearAuth();
            window.location.href = '/login';
            return { error: 'Unauthorized' };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData.error || `HTTP ${response.status}` };
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: String(error) };
    }
}

// ==========================================
// Auth API (Public)
// ==========================================

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        balance: number;
        invite_code: string;
    };
}

export const authApi = {
    login: async (username: string, password: string): Promise<ApiResponse<LoginResponse>> => {
        const res = await request<LoginResponse>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        if (res.data) {
            setToken(String(res.data.token));
            localStorage.setItem('player_user', JSON.stringify(res.data.user));
        }
        return res;
    },

    register: async (
        username: string,
        password: string,
        operatorCode?: string,
        referrerCode?: string
    ): Promise<ApiResponse<LoginResponse>> => {
        const res = await request<LoginResponse>('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username,
                password,
                operator_code: operatorCode,
                referrer_code: referrerCode,
            }),
        });
        if (res.data) {
            setToken(String(res.data.token));
            localStorage.setItem('player_user', JSON.stringify(res.data.user));
        }
        return res;
    },

    logout: () => {
        clearAuth();
        window.location.href = '/login';
    },

    isAuthenticated: () => !!getToken(),
};

// ==========================================
// Game API (Public)
// ==========================================

export const gameApi = {
    getCurrentRound: () => request<any>('/api/v1/games/pc28/round/current'),
    getHistory: () => request<any[]>('/api/v1/games/pc28/history'),
    getOdds: () => request<Record<string, number>>('/api/v1/games/pc28/odds'),
};

// ==========================================
// Bet API (Authenticated)
// ==========================================

export const betApi = {
    placeBet: (data: { round_id: number; bet_type: string; bet_value?: number; amount: number }) =>
        request<any>('/api/v1/bets', {
            method: 'POST',
            body: JSON.stringify(data),
        }, true),
    getUserBets: () => request<any[]>('/api/v1/bets', {}, true),
};

// ==========================================
// Player API (Authenticated)
// ==========================================

export interface ReferralUser {
    id: number;
    username: string;
    total_bet: number;      // 总投注额
    total_win: number;      // 总中奖额
    net_loss: number;       // 客损 (投注额 - 中奖额)
    created_at: string;
}

export interface ReferralStats {
    total_referrals: number;     // 下线总人数
    active_referrals: number;    // 活跃下线
    total_customer_loss: number; // 总客损
    total_commission: number;    // 总佣金
    commission_rate: number;     // 佣金比例
}

export interface DailyEarning {
    date: string;
    customer_loss: number;
    commission: number;
    referral_count: number;
}

export interface EarningsSummary {
    total_earnings: number;
    pending_earnings: number;
    settled_earnings: number;
    daily_earnings: DailyEarning[];
}

export const playerApi = {
    getMe: () => request<any>('/api/v1/player/me', {}, true),
    getInviteCode: () => request<{ invite_code: string; invite_url: string }>('/api/v1/player/invite-code', {}, true),
    getReferrals: () => request<ReferralUser[]>('/api/v1/player/referrals', {}, true),
    getReferralStats: () => request<ReferralStats>('/api/v1/player/referral-stats', {}, true),
    getEarnings: (startDate?: string, endDate?: string) => {
        let url = '/api/v1/player/earnings';
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (params.toString()) url += '?' + params.toString();
        return request<EarningsSummary>(url, {}, true);
    },
};

// ==========================================
// WebSocket
// ==========================================

export function createWebSocket(onMessage: (msg: any) => void): WebSocket {
    const ws = new WebSocket(`${WS_BASE}/ws`);

    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            onMessage(msg);
        } catch (e) {
            console.error('Failed to parse WebSocket message', e);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    return ws;
}
