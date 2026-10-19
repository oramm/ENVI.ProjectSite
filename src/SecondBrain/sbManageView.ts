import type { SbAction, SbEntry, SbLevels } from "./sbManageApi";

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
export const noLevels: SbLevels = { repos: "none", psDb: "none", drive: "none", mail: [] };
export const repoOptions = [["none", "brak"], ["read", "odczyt"], ["write", "zapis"]] as const;
export const psDbOptions = [["none", "brak"], ["ro", "odczyt"], ["rw", "zapis"]] as const;
export const driveOptions = [["none", "brak"], ["connector", "konektor"]] as const;
const optionLabel = (options: readonly (readonly [string, string])[], value: string) => options.find(([key]) => key === value)?.[1] ?? value;
export function describeLevels(entry: SbEntry) {
    const levels = entry.levels ?? noLevels;
    return {
        repos: optionLabel(repoOptions, levels.repos), psDb: optionLabel(psDbOptions, levels.psDb),
        drive: optionLabel(driveOptions, levels.drive), mail: levels.mail.length ? levels.mail.join(", ") : "brak",
    };
}
// Skrzynki znane z konfiguracji poczty firmowej; inne kody z bazy też zostają widoczne w panelu.
export const knownMailboxes = ["marek", "faktury", "chocianow-ik", "wp"];
export const mailboxChoices = (selected: string[]) => [...knownMailboxes, ...selected.filter(code => !knownMailboxes.includes(code))];
export const toggleMailbox = (mail: string[], code: string, on: boolean) =>
    on ? (mail.includes(code) ? mail : [...mail, code]) : mail.filter(item => item !== code);
// Grupy tabeli: administratorzy SB (znacznik CanManageSbAccess) przed pracownikami i zaproszonymi;
// zablokowani i odebrani mają własną grupę, żeby nie znikali z ekranu.
export const entryGroups = [
    { key: "admin", label: "Administratorzy SB", hint: "nadają dostępy" },
    { key: "staff", label: "Pracownicy", hint: "" },
    { key: "invited", label: "Zaproszeni", hint: "jeszcze nie przyjęli zaproszenia" },
    { key: "closed", label: "Zablokowani i odebrani", hint: "" },
] as const;
export function groupKey(entry: SbEntry): (typeof entryGroups)[number]["key"] {
    if (entry.statusCode === "INVITED") return "invited";
    if (entry.statusCode !== "ACTIVE") return "closed";
    return entry.canManageSb ? "admin" : "staff";
}
// Hasła (SBD-2). Które hasła należą się osobie, rozstrzyga PS (secretsExpected); tu tylko podpis i stan.
export const secretLabel = (name: string) =>
    name === "baza-ps" ? "baza PS" : name.startsWith("poczta-") ? `poczta: ${name.slice("poczta-".length)}` : name;
export function secretsState(entry: SbEntry): { text: string; tone: "ok" | "warn" | "off" } {
    const expected = entry.secretsExpected ?? [], given = (entry.secretsGiven ?? []).filter(name => expected.includes(name));
    if (!expected.length) return { text: "—", tone: "off" };
    return { text: `${given.length} z ${expected.length}`, tone: given.length === expected.length ? "ok" : "warn" };
}
/** RSA-OAEP SHA-256 z kluczem 2048 bit mieści najwyżej 190 bajtów tekstu (UTF-8). */
export const SECRET_MAX_BYTES = 190;
export function secretInputError(value: string): string | null {
    if (!value) return "Wpisz hasło.";
    return new TextEncoder().encode(value).length > SECRET_MAX_BYTES ? `Hasło jest za długie (najwyżej ${SECRET_MAX_BYTES} bajtów).` : null;
}
export function takeSecretConfirmation(entry: SbEntry, name: string) {
    return {
        title: `Odebrać hasło: ${secretLabel(name)}?`,
        paragraphs: [
            `Osoba: ${entry.name} ${entry.surname} - ${entry.systemEmail || "brak adresu"}.`,
            "Szyfr zostanie usunięty z PS, więc komputer pracownika nie pobierze go ponownie.",
            "Jeśli komputer już go pobrał, nie da się tego cofnąć - zmień hasło u źródła (w poczcie albo w bazie).",
        ],
    };
}
