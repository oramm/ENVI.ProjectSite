/**
 * Podpisy pism na liście: jedno zbiorcze zapytanie zamiast jednego na wiersz.
 *
 * Każdy wiersz listy pism prosi o swoje podpisy przez `useLetterSignatures(letterId)`. Prośby z jednego
 * „tchnienia” renderowania (kilkadziesiąt wierszy) zbiera krótki timer i wysyła jako jedno
 * POST /letters/signatureSummary. Wynik jest podręczny, dopóki ktoś nie wywoła
 * `invalidateLetterSignatures` (po udanym podpisie albo wgraniu pliku).
 *
 * Plakietka jest ozdobą informacyjną: błąd zapytania nie może zepsuć listy ani sypać komunikatami,
 * więc wiersz po prostu zostaje bez plakietki.
 */
import { useEffect, useSyncExternalStore } from "react";
import { LetterSignatureSummaryEntry, SigningApi } from "./SigningApi";

/** Okno zbierania próśb z jednego renderu listy. */
const BATCH_DELAY_MS = 40;
/** Serwer przyjmuje najwyżej tyle pism naraz (MAX_LETTERS_PER_SUMMARY). */
const BATCH_SIZE = 500;

type Entry = LetterSignatureSummaryEntry | null;

const cache = new Map<number, Entry>();
const pending = new Set<number>();
const inFlight = new Set<number>();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
let version = 0;

function emit() {
    version++;
    listeners.forEach((listener) => listener());
}

async function flush() {
    timer = undefined;
    const ids = [...pending];
    pending.clear();
    for (let start = 0; start < ids.length; start += BATCH_SIZE) {
        const chunk = ids.slice(start, start + BATCH_SIZE);
        chunk.forEach((id) => inFlight.add(id));
        try {
            const { summary } = await SigningApi.summarizeSignatures(chunk);
            for (const id of chunk) cache.set(id, summary[String(id)] ?? null);
        } catch {
            // Bez plakietki, bez ponawiania w pętli: kolejna próba przy następnym otwarciu listy.
            for (const id of chunk) cache.set(id, null);
        } finally {
            chunk.forEach((id) => inFlight.delete(id));
        }
    }
    emit();
}

function request(letterId: number) {
    if (cache.has(letterId) || pending.has(letterId) || inFlight.has(letterId)) return;
    pending.add(letterId);
    if (timer === undefined) timer = setTimeout(flush, BATCH_DELAY_MS);
}

/** Po nowym podpisie: zapomnij wpis, a zamontowane plakietki same zapytają ponownie. */
export function invalidateLetterSignatures(letterId: number) {
    cache.delete(letterId);
    emit();
}

/** Tylko testy. */
export function resetLetterSignaturesStore() {
    cache.clear();
    pending.clear();
    inFlight.clear();
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    emit();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Podpisy jednego pisma; `undefined` = jeszcze nie wiadomo, `null` = brak podpisów. */
export function useLetterSignatures(letterId: number | undefined): Entry | undefined {
    // Migawka to numer wersji, a wynik czytamy z cache — useSyncExternalStore wymaga stabilnej wartości.
    useSyncExternalStore(subscribe, () => version);
    useEffect(() => {
        if (letterId !== undefined) request(letterId);
    });
    if (letterId === undefined) return null;
    return cache.has(letterId) ? cache.get(letterId) : undefined;
}
