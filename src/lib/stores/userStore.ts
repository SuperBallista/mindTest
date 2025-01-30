import { writable } from 'svelte/store';

// ✅ 사용자 관련 상태
export const userId = writable<string | null>(null);
export const username = writable<string | null>(null);
export const key = writable<number>(0);
export const origin = writable<string>("");


