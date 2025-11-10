/**
 * Utilities for Forms and Business Object Selectors
 * Centralizuje logikę walidacji i bezpiecznego dostępu do pól
 */

import ToolsFetch from "./ToolsFetch";

// ===== TYPES =====

type LogLevel = "error" | "warn" | "info" | "debug";

// ===== LOGGING CONFIGURATION =====

const LOG_CONFIG = {
    enabled: true, // Ustaw false w production lub kontroluj przez ENV
    minLevel: "warn" as LogLevel, // Minimalny poziom logowania
};

const LOG_LEVELS: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

function shouldLog(level: LogLevel): boolean {
    return LOG_CONFIG.enabled && LOG_LEVELS[level] <= LOG_LEVELS[LOG_CONFIG.minLevel];
}

/**
 * Loguje komunikaty związane z selektorami z odpowiednim formatowaniem
 */
function logSelector(level: LogLevel, selectorName: string, message: string, data?: any): void {
    if (!shouldLog(level)) return;

    const emoji = { error: "❌", warn: "⚠️", info: "ℹ️", debug: "🔍" };
    const prefix = `${emoji[level]} [${selectorName}]`;

    if (level === "error") {
        console.error(prefix, message, data);
    } else if (level === "warn") {
        console.warn(prefix, message, data);
    } else {
        console.log(prefix, message, data);
    }
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Zapewnia że obiekt ma wymagane pole labelKey.
 * Jeśli pole nie istnieje lub jest puste, tworzy je z wartością fallback.
 *
 * @param item - Obiekt do walidacji
 * @param labelKey - Nazwa wymaganego pola
 * @param selectorName - Nazwa selektora (do logowania)
 * @returns Obiekt z zagwarantowanym polem labelKey
 */
export function ensureLabelKey<T extends Record<string, any>>(item: T, labelKey: string, selectorName: string): T {
    if (!item || typeof item !== "object") {
        logSelector("error", selectorName, "Otrzymano nieprawidłowy obiekt (null lub nie-obiekt)", item);
        return { [labelKey]: "[Błąd danych]" } as T;
    }

    const value = item[labelKey];

    // Sprawdź czy wartość istnieje i jest stringiem
    if (value === undefined || value === null || value === "" || typeof value !== "string") {
        const errorDetails = {
            receivedKeys: Object.keys(item),
            labelKeyValue: value,
            labelKeyType: typeof value,
            object: item,
        };

        logSelector(
            "warn",
            selectorName,
            `Brak wymaganego pola "${labelKey}" lub nie jest stringiem. Struktura obiektu:`,
            errorDetails
        );

        // 📧 Wyślij raport błędu na serwer (automatyczne zgłoszenie niespójności backendu)
        ToolsFetch.sendClientErrorReport(
            new Error(`Backend Data Validation Failed: Missing or invalid labelKey "${labelKey}"`),
            {
                action: "ensureLabelKey_validation_failed",
                selectorName,
                labelKey,
                ...errorDetails,
            }
        ).catch((err) => {
            // Nie blokuj działania aplikacji jeśli wysłanie raportu się nie powiodło
            console.error("Nie udało się wysłać raportu walidacji:", err);
        });

        return { ...item, [labelKey]: "[Brak danych]" } as T;
    }

    return item;
}

/**
 * Uniwersalna funkcja do bezpiecznego odczytywania wartości z obiektu.
 * Obsługuje zarówno ścieżki zagnieżdżone jak i alternatywne pola.
 *
 * @example
 * // Pojedyncze pole
 * safeGetFirstField(obj, ["name"], "Brak")
 *
 * // Alternatywne pola (pierwsze znalezione)
 * safeGetFirstField(contract, ["ourId", "number"], "Brak")
 *
 * // Ścieżka zagnieżdżona (notacja kropkowa)
 * safeGetFirstField(person, ["_entity.name"], "Brak")
 *
 * // Mix - alternatywy + ścieżki
 * safeGetFirstField(offer, ["alias", "_city.name"], "Brak")
 *
 * @param obj - Obiekt źródłowy
 * @param fieldPaths - Lista pól/ścieżek (sprawdzane po kolei). Ścieżki zagnieżdżone oddzielaj kropką.
 * @param fallback - Wartość zwracana gdy żadne pole nie istnieje
 * @param selectorName - Opcjonalna nazwa selektora (do logowania)
 * @returns Wartość pierwszego znalezionego pola lub fallback
 */
export function safeGetFirstField<T>(obj: any, fieldPaths: string[], fallback: T, selectorName?: string): T {
    if (!obj || typeof obj !== "object") {
        return fallback;
    }

    // Sprawdź każdą ścieżkę/pole po kolei
    for (const fieldPath of fieldPaths) {
        // Czy to ścieżka zagnieżdżona? (zawiera kropkę)
        const pathParts = fieldPath.split(".");

        // Nawiguj przez ścieżkę
        let current = obj;
        let pathValid = true;

        for (const part of pathParts) {
            if (!current || typeof current !== "object" || !(part in current)) {
                pathValid = false;
                break;
            }
            current = current[part];
        }

        // Ścieżka nieprawidłowa - sprawdź następną
        if (!pathValid) {
            continue;
        }

        // Sprawdź czy wartość końcowa jest poprawna
        if (current === undefined || current === null || current === "") {
            continue;
        }

        // Obiekt/array → pomiń i szukaj dalej
        if (typeof current === "object") {
            if (selectorName && shouldLog("debug")) {
                logSelector("debug", selectorName, `Ścieżka "${fieldPath}" wskazuje na obiekt, szukam dalej`);
            }
            continue;
        }

        // ✅ Znaleziono poprawną wartość
        return current as T;
    }

    // Nie znaleziono żadnego pola
    if (selectorName && shouldLog("debug")) {
        logSelector("debug", selectorName, `Brak wartości dla ścieżek [${fieldPaths.join(", ")}]`);
    }

    return fallback;
}

// ===== EXPORTS =====

export { logSelector };
export type { LogLevel };

// ===== LEGACY CLASS (zachowane dla kompatybilności) =====

export default class ToolsForms {
    static getSuggestedClass(field: string, watchAllFields: any, initValue: any): string {
        return watchAllFields[field] === initValue ? "text-primary" : "";
    }

    // Statyczne metody dla łatwego dostępu
    static ensureLabelKey = ensureLabelKey;
    static safeGetFirstField = safeGetFirstField;
    static logSelector = logSelector;
}
