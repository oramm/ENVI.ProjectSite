/**
 * Numer nadania przesyłki Poczty Polskiej — walidacja po stronie przeglądarki.
 *
 * Numer jest kodem GS1 SSCC: 18 cyfr, ostatnia to cyfra kontrolna mod 10.
 * Kod kreskowy na potwierdzeniu niesie dodatkowo identyfikator aplikacji `(00)`,
 * więc skaner zwraca 20 znaków. W arkuszu numer stoi w postaci `(00)` + 18 cyfr.
 *
 * Ta walidacja istnieje po to, żeby przekłamany odczyt nie wszedł do formularza.
 * Nikt nie sprawdza wzrokiem osiemnastu cyfr — jeżeli skaner pomyli jedną, cyfra
 * kontrolna to wyłapie, a bez niej błąd byłby niewykrywalny.
 *
 * Backend ma tę samą regułę w `PostalDispatchItem.normalizeTrackingNumber` i to on
 * decyduje przy zapisie. Ta kopia służy natychmiastowej informacji zwrotnej przy
 * skanowaniu, nie zaufaniu.
 */

/** Zdejmuje identyfikator aplikacji i zostawia 18 cyfr; `null` gdy to nie jest numer nadania. */
export function normalizeTrackingNumber(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const digits = String(raw).replace(/\D+/g, "");
    const candidate = digits.length === 20 && digits.startsWith("00") ? digits.slice(2) : digits;
    if (candidate.length !== 18) return null;
    return hasValidCheckDigit(candidate) ? candidate : null;
}

/** Cyfra kontrolna GS1 (mod 10): od prawej wagi 3, 1, 3, 1… na 17 cyfrach danych. */
export function hasValidCheckDigit(sscc: string): boolean {
    if (!/^\d{18}$/.test(sscc)) return false;
    const data = sscc.slice(0, 17);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        const digit = Number(data[data.length - 1 - i]);
        sum += i % 2 === 0 ? digit * 3 : digit;
    }
    return (10 - (sum % 10)) % 10 === Number(sscc[17]);
}

export function isValidTrackingNumber(raw: string | null | undefined): boolean {
    return normalizeTrackingNumber(raw) !== null;
}

/** Postać wyświetlana i zapisywana w arkuszu. */
export function formatTrackingNumber(sscc: string): string {
    return `(00)${sscc}`;
}

export type ScanRejection =
    | "not-a-number"
    | "unsupported-code"
    | "wrong-length"
    | "bad-check-digit"
    | "duplicate";

/**
 * Kod S10 (UPU): dwie litery usługi, dziewięć cyfr, dwie litery kraju — np. `EE 38 951 937 5 PL`.
 * Tak oznaczone są Pocztex i paczki, których etap 1 nie obsługuje.
 */
const S10_PATTERN = /^[A-Z]{2}\d{9}[A-Z]{2}$/;

/**
 * Powód odrzucenia odczytu, w formie nadającej się do pokazania człowiekowi.
 *
 * Rozdzielamy trzy sytuacje, bo przy biurku znaczą co innego: „przyłożyłeś inny rodzaj
 * przesyłki", „przyłóż jeszcze raz, bo się nie doczytało" i „ten list już jest na liście".
 * Zlanie ich w jeden komunikat kończy się przykładaniem tego samego kodu w kółko.
 */
export function describeRejection(raw: string, known: readonly string[] = []): ScanRejection | null {
    const text = String(raw ?? "").toUpperCase().replace(/\s+/g, "");
    if (S10_PATTERN.test(text)) return "unsupported-code";

    const digits = text.replace(/\D+/g, "");
    if (digits.length === 0) return "not-a-number";
    const candidate = digits.length === 20 && digits.startsWith("00") ? digits.slice(2) : digits;
    if (candidate.length !== 18) return "wrong-length";
    if (!hasValidCheckDigit(candidate)) return "bad-check-digit";
    if (known.includes(candidate)) return "duplicate";
    return null;
}

export const REJECTION_MESSAGES: Record<ScanRejection, string> = {
    "not-a-number": "To nie jest kod kreskowy przesyłki.",
    "unsupported-code": "To Pocztex albo paczka — na razie takie przesyłki wpisuje się ręcznie.",
    "wrong-length": "Odczyt jest niepełny — przyłóż potwierdzenie jeszcze raz.",
    "bad-check-digit": "Kod odczytany błędnie — przyłóż potwierdzenie jeszcze raz.",
    duplicate: "Ten list jest już na liście.",
};
