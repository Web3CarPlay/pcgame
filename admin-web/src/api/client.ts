const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

// Token management
function getToken(): string | null {
    const stored = localStorage.getItem('admin_token');
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
        localStorage.setItem('admin_token', JSON.stringify(token));
    } else {
        localStorage.removeItem('admin_token');
    }
}

function clearAuth() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
}

// Request helper
async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true,
    skipRedirect: boolean = false
): Promise<ApiResponse<T>> {
    try {
        const token = getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token && requireAuth) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401 && !skipRedirect) {
            clearAuth();
            window.location.href = '/login';
            return { error: 'Unauthorized' };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData.error || `HTTP ${response.status}` };
        }

        // Handle empty responses
        const text = await response.text();
        if (!text) {
            return { data: {} as T };
        }

        const data = JSON.parse(text);
        return { data };
    } catch (error) {
        return { error: String(error) };
    }
}

// ==========================================
// Auth API
// ==========================================

export interface LoginResponse {
    token: string;
    admin: {
        id: number;
        username: string;
        role: string;
    };
}

export const authApi = {
    login: async (username: string, password: string): Promise<ApiResponse<LoginResponse>> => {
        const res = await request<LoginResponse>('/api/v1/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }, false, true);

        if (res.data) {
            setToken(String(res.data.token));
            localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
        }
        return res;
    },

    getMe: () => request<{ id: number; username: string; role: string }>('/api/v1/me'),

    logout: () => {
        clearAuth();
        window.location.href = '/login';
    },

    isAuthenticated: () => !!getToken(),
};

// ==========================================
// Game API (public, no auth required)
// ==========================================

export const gameApi = {
    getCurrentRound: () => request<any>('/api/v1/games/pc28/round/current', {}, false),
    getHistory: () => request<any[]>('/api/v1/games/pc28/history', {}, false),
    getOdds: () => request<Record<string, number>>('/api/v1/games/pc28/odds', {}, false),
};

// ==========================================
// Operator API (admin auth required)
// ==========================================

export const operatorApi = {
    list: () => request<any[]>('/api/v1/admin/operators'),
    create: (data: { code: string; name: string; commission: number }) =>
        request<any>('/api/v1/admin/operators', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    update: (id: number, data: { code: string; name: string; commission: number }) =>
        request<any>(`/api/v1/admin/operators/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    delete: (id: number) =>
        request(`/api/v1/admin/operators/${id}`, { method: 'DELETE' }),
    getUsers: (id: number) => request<any[]>(`/api/v1/admin/operators/${id}/users`),
};

// ==========================================
// User API (admin auth required)
// ==========================================

export const userApi = {
    list: () => request<any[]>('/api/v1/users'),
};

// ==========================================
// Admin API (super_admin only)
// ==========================================

export const adminApi = {
    list: () => request<any[]>('/api/v1/admins'),
    create: (data: { username: string; password: string; role: string }) =>
        request<any>('/api/v1/admins', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};
