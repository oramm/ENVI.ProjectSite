/**
 * Teksty dla użytkownika w oknach podpisu: powody przerwania zlecenia przez program ENVI Podpis
 * zamienione na zwykłe zdania oraz kod kontrolny w czytelnej postaci.
 *
 * Powody wysyła program (desktop/envi-podpis/src/Messages.cs, pole CancelReason) i trafiają do PS jako
 * `cancelReason`. Teksty tu mają być spójne z tym, co program sam pokazuje w swoim oknie.
 */

/** Powód zapisywany przy anulowaniu z okna PS; rozpoznajemy go po powrocie ze statusu. */
export const CANCEL_REASON_FROM_PS = "ps_user_cancelled";

export type CancelExplanation = {
    /** Co się stało, zwykłymi słowami. */
    message: string;
    /** Czy główną sugestią jest „Wgraj podpisany” (zamiast ponawiania w programie). */
    suggestUpload: boolean;
};

const NOTHING_SIGNED = "Nic nie zostało podpisane.";

export function explainCancelReason(reason: string | null | undefined): CancelExplanation {
    const code = (reason ?? "").trim();
    switch (code) {
        case CANCEL_REASON_FROM_PS:
        case "Anulowane w PS":
            return { message: `Podpisywanie zostało anulowane. ${NOTHING_SIGNED}`, suggestUpload: false };
        case "user_cancelled":
            return {
                message: `Podpisywanie zostało anulowane w programie ENVI Podpis. ${NOTHING_SIGNED}`,
                suggestUpload: false,
            };
        case "no_certificate":
            return {
                message: `Program nie znalazł karty z podpisem kwalifikowanym. Włóż kartę do czytnika (Windows potrzebuje kilku sekund, żeby ją zobaczyć) i spróbuj ponownie. ${NOTHING_SIGNED}`,
                suggestUpload: false,
            };
        case "signing_WrongPin":
            return {
                message: `Karta nie przyjęła PIN-u. ${NOTHING_SIGNED} Uwaga: karta liczy błędne próby i po kilku blokuje się, a program nie ponawia PIN-u sam. Spróbuj ponownie tylko wtedy, gdy masz pewność co do PIN-u.`,
                suggestUpload: false,
            };
        case "signing_PinBlocked":
            return {
                message: `Karta zablokowała PIN po zbyt wielu błędnych próbach. ${NOTHING_SIGNED} Odblokowanie wymaga kodu PUK od wystawcy karty. Tymczasem możesz podpisać plik innym programem i wgrać go tutaj.`,
                suggestUpload: true,
            };
        case "signing_NoCard":
            return {
                message: `Program przestał widzieć kartę w czytniku. ${NOTHING_SIGNED} Sprawdź, czy karta jest włożona do końca, i spróbuj ponownie.`,
                suggestUpload: false,
            };
        case "signing_Cancelled":
            return {
                message: `Okno PIN-u karty zostało zamknięte bez podania PIN-u. ${NOTHING_SIGNED}`,
                suggestUpload: false,
            };
        case "signing_UnsupportedKey":
            return {
                message: `Tej karty program jeszcze nie obsługuje. ${NOTHING_SIGNED} Podpisz plik innym programem i wgraj go tutaj.`,
                suggestUpload: true,
            };
        case "signing_InvalidResult":
        case "signing_Other":
            return {
                message: `Karta nie zwróciła poprawnego podpisu. Najczęściej oznacza to błędny PIN albo problem z kartą. ${NOTHING_SIGNED} Karta mogła policzyć tę próbę jako błędny PIN, więc przed kolejną upewnij się co do PIN-u.`,
                suggestUpload: false,
            };
        case "check_code_mismatch":
            return {
                message: `Kod kontrolny w programie nie zgadzał się z kodem z PS, więc program dla bezpieczeństwa niczego nie podpisał. ${NOTHING_SIGNED}`,
                suggestUpload: false,
            };
        case "file_count_mismatch":
            return {
                message: `Lista plików w programie nie zgadzała się z listą z PS, więc program dla bezpieczeństwa niczego nie podpisał. ${NOTHING_SIGNED}`,
                suggestUpload: false,
            };
        case "api_error":
        case "program_error":
            return {
                message: `Program ENVI Podpis zgłosił problem i przerwał pracę. ${NOTHING_SIGNED} Spróbuj ponownie; jeśli problem się powtarza, zgłoś to.`,
                suggestUpload: false,
            };
        case "":
            return { message: `Podpisywanie zostało anulowane. ${NOTHING_SIGNED}`, suggestUpload: false };
        default:
            return {
                message: `Podpisywanie zostało przerwane (powód podany przez program: ${code}). ${NOTHING_SIGNED}`,
                suggestUpload: false,
            };
    }
}

/** Kod kontrolny w postaci XXXX-XXXX (serwer może przysłać go z kreską albo bez). */
export function formatCheckCode(code: string | null | undefined): string {
    const compact = (code ?? "").replace(/[^0-9A-Za-z]/g, "").toUpperCase();
    if (compact.length !== 8) return (code ?? "").toUpperCase();
    return `${compact.slice(0, 4)}-${compact.slice(4)}`;
}

function plural(n: number, one: string, few: string, many: string): string {
    if (n === 1) return `${n} ${one}`;
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${n} ${few}`;
    return `${n} ${many}`;
}

/** „1 plik”, „2 pliki”, „5 plików”. */
export function pluralFiles(n: number): string {
    return plural(n, "plik", "pliki", "plików");
}

/** „1 strona”, „2 strony”, „5 stron”. */
export function pluralPages(n: number): string {
    return plural(n, "strona", "strony", "stron");
}
