/**
 * NIP validator — pełna suma kontrolna (mod 11), standard WS10/O2.
 *
 * Normalizacja identyczna jak KSeF: raw.replace(/\D+/g, '').
 * Wagi pozycji 1–9: [6, 5, 7, 2, 3, 4, 5, 6, 7].
 * suma = Σ(cyfra[i] * waga[i]) dla i=0..8; c = suma mod 11.
 * c == 10 → niepoprawny; poprawny ⟺ c == cyfra[10].
 * Guard: odrzuć "0000000000".
 */
export const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7] as const;

export function normalizeNip(raw: string): string {
    return raw.replace(/\D+/g, "");
}

export function validateNipChecksum(raw: string): boolean {
    const digits = normalizeNip(raw);
    if (!/^\d{10}$/.test(digits)) return false;
    if (digits === "0000000000") return false;

    const d = digits.split("").map(Number);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += d[i] * NIP_WEIGHTS[i];
    }
    const c = sum % 11;
    if (c === 10) return false;
    return c === d[9];
}
