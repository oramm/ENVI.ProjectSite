import type { SbAction, SbEntry } from "./sbManageApi";

export const statusViews = {
    INVITED: { label: "Zaproszony", variant: "warning" },
    ACTIVE: { label: "Aktywny", variant: "success" },
    BLOCKED: { label: "Zablokowany", variant: "secondary" },
    REVOKED: { label: "Odebrany", variant: "dark" },
};
export const manualExplanation = "Nadane ręcznie przed uruchomieniem modułu. Moduł nie zdejmuje takiego dostępu - zmień go ręcznie na GitHubie i na Dysku.";
export const localCopyExplanation = "To, co już pobrała na swój komputer (kopia wiedzy, skille), zostaje - zdalnego kasowania nie ma.";
const actionLabels: Record<SbAction, string> = { invite: "Zaproszenie", block: "Blokada", unblock: "Odblokowanie", revoke: "Odebranie", assign: "Przypisanie konta GitHub" };
export function availableActions(entry: SbEntry): { action: SbAction; label: string; confirm?: boolean }[] {
    if (entry.isGrantedManually) return [];
    const block = { action: "block" as const, label: "Zablokuj", confirm: true };
    const revoke = { action: "revoke" as const, label: "Odbierz", confirm: true };
    const remaining = entry.githubInvitationId != null || !!entry.drivePermissionId;
    switch (entry.statusCode) {
        case "INVITED": return [{ action: "invite", label: "Ponów zaproszenie" }, block, revoke];
        case "ACTIVE": return [block, revoke];
        case "BLOCKED": return [{ action: "unblock", label: "Odblokuj" }, revoke, ...(remaining ? [{ action: "block" as const, label: "Ponów blokadę" }] : [])];
        case "REVOKED": return remaining ? [{ action: "revoke", label: "Ponów odebranie" }] : [];
    }
}
// Nazwa roli z PS jest kodem systemowym; na ekranie kierownika pokazujemy polską nazwę.
export const roleLabel = (systemRoleName: string | null) =>
    systemRoleName === "ENVI_MANAGER" ? "kierownik" : systemRoleName === "ENVI_EMPLOYEE" ? "pracownik" : systemRoleName || "brak roli";
export function describeGithub(entry: SbEntry): string {
    return entry.githubLogin || (entry.statusCode === "INVITED" && entry.githubInvitationId != null ? "zaproszenie czeka" : "niepowiązane");
}
export function describeDrive(entry: SbEntry): string {
    if (entry.drivePermissionId) return "jest";
    if (entry.isGrantedManually) return "nadane ręcznie";
    // Brak numeru w stanach nadania oznacza brak zapisu, w stanach odebrania - zdjęty dostęp.
    return entry.statusCode === "INVITED" || entry.statusCode === "ACTIVE" ? "brak zapisu" : "zdjęty";
}
export function describeFailure(status: number, message: string): string {
    switch (status) {
        case 503: return "Funkcja nieskonfigurowana - serwer PS nie ma tokenu GitHub do zapraszania. Nic nie zostało zmienione.";
        case 502: return `${message} Nic nie zostało zmienione.`.trim();
        case 409: case 422: case 400: return message || `Nie udało się wykonać operacji (kod ${status}).`;
        case 401: case 403: return "Nie masz uprawnienia do zarządzania dostępem do Second Brain.";
        case 0: return "Brak połączenia z serwerem PS. Spróbuj ponownie.";
        default: return `Nie udało się wykonać operacji (kod ${status}).`;
    }
}
export function describeOutcome(action: SbAction, personLabel: string, result: "OK" | "PARTIAL", note: string) {
    return result === "PARTIAL"
        ? { variant: "warning" as const, message: `Wykonano tylko częściowo: ${actionLabels[action]} - ${personLabel}. ${note} Powtórz operację, a jeśli dostęp nadal pozostaje, zdejmij go ręcznie na GitHubie i na Dysku.` }
        : { variant: "success" as const, message: `Wykonano: ${actionLabels[action]} - ${personLabel}.${note ? ` ${note}` : ""}` };
}
export function confirmationContent(action: "block" | "revoke", entry: SbEntry) {
    return {
        title: action === "block" ? "Zablokować dostęp do Second Brain?" : "Odebrać dostęp do Second Brain na stałe?",
        paragraphs: [
            `Osoba: ${entry.name} ${entry.surname} - ${entry.systemEmail || "brak adresu"}.`,
            "Osoba zostanie usunięta z organizacji GitHub (albo anulowane zostanie jej oczekujące zaproszenie) i straci dostęp do dysku SB.ENVI, więc nie pobierze już nowej wiedzy.",
            action === "block" ? 'Blokadę można cofnąć przyciskiem "Odblokuj". Osoba dostanie wtedy nowe zaproszenie na GitHubie i musi je przyjąć.' : "Odebranie kończy dostęp na stałe; ponowne dopuszczenie to nowe zaproszenie.",
            localCopyExplanation,
        ],
    };
}
export const assignableEntries = (entries: SbEntry[]) => entries.filter(entry =>
    (entry.statusCode === "INVITED" || entry.statusCode === "ACTIVE") && entry.githubLogin === null && !entry.isGrantedManually);
