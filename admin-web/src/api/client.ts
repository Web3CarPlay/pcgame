const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

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

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const token = getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
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

// Auth API
export const authApi = {
    login: (username: string, password: string) =>
        request<{ token: string; admin: { id: number; username: string; role: string } }>(
            '/api/v1/login',
            {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            }
        ),
    getMe: () => request<{ id: number; username: string; role: string }>('/api/v1/me'),
};

// Game API
export const gameApi = {
    getCurrentRound: () => request<any>('/api/v1/games/pc28/round/current'),
    getHistory: () => request<any[]>('/api/v1/games/pc28/history'),
    getOdds: () => request<Record<string, number>>('/api/v1/games/pc28/odds'),
};

// Operator API
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
        request('/api/v1/admin/operators/${id}', { method: 'DELETE' }),
    getUsers: (id: number) => request<any[]>(`/api/v1/admin/operators/${id}/users`),
};

// User API
export const userApi = {
    list: () => request<any[]>('/api/v1/users'),
};

// Admin API (super_admin only)
export const adminApi = {
    list: () => request<any[]>('/api/v1/admins'),
    create: (data: { username: string; password: string; role: string }) =>
        request<any>('/api/v1/admins', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};
