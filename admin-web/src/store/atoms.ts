import { atom } from 'jotai';

// Auth State
export interface User {
    id: number;
    username: string;
    role: string;
}

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

// Game State
export interface Round {
    id: number;
    issue_number: string;
    keno_data: string;
    result_a: number;
    result_b: number;
    result_c: number;
    sum: number;
    open_time: string;
    close_time: string;
    status: string;
}

export const currentRoundAtom = atom<Round | null>(null);
export const roundHistoryAtom = atom<Round[]>([]);

// UI State
export const sidebarOpenAtom = atom(true);
export const loadingAtom = atom(false);
