const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

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

// Game API
export const gameApi = {
    getCurrentRound: () => request<any>('/api/v1/games/pc28/round/current'),
    getHistory: () => request<any[]>('/api/v1/games/pc28/history'),
    getOdds: () => request<Record<string, number>>('/api/v1/games/pc28/odds'),
};

// Bet API
export const betApi = {
    placeBet: (data: { round_id: number; bet_type: string; bet_value?: number; amount: number }) =>
        request<any>('/api/v1/bets', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getUserBets: () => request<any[]>('/api/v1/bets'),
};

export default { gameApi, betApi };
