import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Auth State
export interface PlayerUser {
    id: number;
    username: string;
    balance: number;
    invite_code: string;
}

export const playerTokenAtom = atomWithStorage<string | null>('player_token', null);
export const playerUserAtom = atomWithStorage<PlayerUser | null>('player_user', null);
export const isAuthenticatedAtom = atom((get) => get(playerTokenAtom) !== null);

// Game State
export interface GameRound {
    id: number;
    issue_number: string;
    status: string;
    sum?: number;
    result_a?: number;
    result_b?: number;
    result_c?: number;
    close_time: string;
}

export const currentRoundAtom = atom<GameRound | null>(null);
export const countdownAtom = atom<number>(0);
export const historyAtom = atom<GameRound[]>([]);

// Betting State
export interface BetSelection {
    type: string;
    value?: number;
    amount: number;
}

export const selectedChipAtom = atom<number>(10);
export const betSelectionsAtom = atom<BetSelection[]>([]);

// UI State
export const isLoadingAtom = atom<boolean>(false);
