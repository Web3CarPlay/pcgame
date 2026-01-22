import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Auth State
export interface AdminUser {
    id: number;
    username: string;
    role: string; // super_admin, admin, operator
}

export const tokenAtom = atomWithStorage<string | null>('admin_token', null);
export const adminUserAtom = atomWithStorage<AdminUser | null>('admin_user', null);
export const isAuthenticatedAtom = atom((get) => get(tokenAtom) !== null);
export const isSuperAdminAtom = atom((get) => get(adminUserAtom)?.role === 'super_admin');

// Game State
export const currentRoundAtom = atom<any>(null);
export const historyAtom = atom<any[]>([]);

// UI State
export const sidebarOpenAtom = atom<boolean>(true);
