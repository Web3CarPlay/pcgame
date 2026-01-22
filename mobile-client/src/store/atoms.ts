import { atom } from 'jotai';

// Auth State
export interface User {
    id: number;
    username: string;
    balance: number;
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
export const countdownAtom = atom<number>(0);
export const historyAtom = atom<Round[]>([]);

// Betting State
export interface BetSelection {
    type: string;
    value?: number;
    amount: number;
}

export const selectedBetsAtom = atom<BetSelection[]>([]);
export const chipAmountAtom = atom<number>(10);

// WebSocket State
export const wsConnectedAtom = atom<boolean>(false);
