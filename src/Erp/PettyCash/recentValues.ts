/**
 * Podpowiedzi ostatnio używanych wartości, trzymane w przeglądarce na tym urządzeniu.
 *
 * Powód istnienia: wpisy powstają na telefonie, więc każde pole, którego nie trzeba
 * wystukać na ekranowej klawiaturze, jest realną oszczędnością. Kwoty przesyłek to
 * w praktyce dwie stawki, adresaci się powtarzają, a płacący i data prawie zawsze
 * są te same co przy poprzednim wpisie.
 *
 * Świadomie `localStorage`, nie backend: to wygoda jednej osoby na jednym telefonie,
 * a nie dane firmowe. Awaria pamięci przeglądarki nie może niczego zablokować, więc
 * każdy odczyt kończy się pustą listą zamiast wyjątkiem.
 */

const PREFIX = "pettyCash.recent.";
const LIMIT = 6;

function read(key: string): string[] {
    try {
        const raw = window.localStorage.getItem(PREFIX + key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
    } catch {
        return [];
    }
}

function write(key: string, values: string[]): void {
    try {
        window.localStorage.setItem(PREFIX + key, JSON.stringify(values.slice(0, LIMIT)));
    } catch {
        // Pamięć pełna albo wyłączona — podpowiedzi są wygodą, nie warunkiem pracy.
    }
}

/** Najnowsze na początku, bez duplikatów, maksymalnie sześć. */
export function remember(key: string, value: string): string[] {
    const trimmed = value.trim();
    if (!trimmed) return read(key);
    const next = [trimmed, ...read(key).filter((v) => v !== trimmed)].slice(0, LIMIT);
    write(key, next);
    return next;
}

export function recall(key: string): string[] {
    return read(key);
}

/** Ostatnio użyta wartość — do podstawienia w nowym formularzu. */
export function lastUsed(key: string): string | null {
    return read(key)[0] ?? null;
}

export function forget(key: string): void {
    try {
        window.localStorage.removeItem(PREFIX + key);
    } catch {
        // jak wyżej
    }
}

export const RECENT_KEYS = {
    payer: "payer",
    addressee: "addressee",
    itemAmount: "itemAmount",
} as const;
