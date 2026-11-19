import { describe, expect, it } from "vitest";
import type { SbEntry, SbHealth } from "../sbManageApi";
import { agentStateTone, routeAccessLabel, canReceiveSecret, defaultSecretRecipients, secretCharacterCount, secretConfirmationError, secretHealthState, secretRecipients, sharedSecretNames } from "../sbManageView";
import { assignableEntries, availableActions, confirmationContent, describeDrive, describeFailure, describeGithub, describeLevels, describeOutcome, groupKey, roleLabel, secretInputError, secretLabel, secretsState, toggleMailbox, mailboxChoices, statusViews, healthColumn, formatHealthDate, healthVersions, healthToolLabel, canRequestHealth } from "../sbManageView";

const entry = (over: Partial<SbEntry> = {}): SbEntry => ({
    id: 1, personId: 1, name: "Anna", surname: "Nowak", systemEmail: "anna@example.com",
    statusCode: "ACTIVE", githubLogin: null, githubInvitationId: null, drivePermissionId: null,
    isGrantedManually: false, createdAt: "", updatedAt: "", ...over,
});
describe("Widok zarządzania SB", () => {
    it.each([
        ["INVITED", ["Ponów zaproszenie", "Zablokuj", "Odbierz"]],
        ["ACTIVE", ["Zablokuj", "Odbierz"]], ["BLOCKED", ["Odblokuj", "Odbierz"]], ["REVOKED", []],
    ] as const)("akcje stanu %s i brak akcji ręcznych", (statusCode, labels) => {
        expect(availableActions(entry({ statusCode })).map(action => action.label)).toEqual(labels);
        expect(availableActions(entry({ statusCode, isGrantedManually: true, drivePermissionId: "d" }))).toEqual([]);
    });
    it.each(["BLOCKED", "REVOKED"] as const)("ponowienie %s tylko przy pozostałym numerze", statusCode => {
        for (const ids of [{ githubInvitationId: 42 }, { drivePermissionId: "d" }]) {
            const actions = availableActions(entry({ statusCode, ...ids }));
            expect(actions[actions.length - 1]?.label).toBe(statusCode === "BLOCKED" ? "Ponów blokadę" : "Ponów odebranie");
        }
        expect(availableActions(entry({ statusCode })).some(action => action.label.startsWith("Ponów"))).toBe(false);
    });
    it("rozróżnia stany i zapisy usług", () => {
        expect(new Set(Object.values(statusViews).map(view => view.variant)).size).toBe(4);
        expect(describeGithub(entry())).toBe("niepowiązane");
        expect(describeGithub(entry({ statusCode: "INVITED", githubInvitationId: 2 }))).toBe("zaproszenie czeka");
        expect(describeGithub(entry({ githubLogin: "anna" }))).toBe("anna");
        expect(describeDrive(entry())).toBe("brak zapisu");
        expect(describeDrive(entry({ isGrantedManually: true }))).toBe("nadane ręcznie");
        expect(describeDrive(entry({ statusCode: "REVOKED" }))).toBe("zdjęty");
        expect(describeDrive(entry({ drivePermissionId: "d" }))).toBe("jest");
    });
    it.each([
        [503, "Funkcja nieskonfigurowana"], [502, "Uwaga Nic nie zostało zmienione."],
        [409, "Uwaga"], [422, "Uwaga"], [400, "Uwaga"], [403, "Nie masz uprawnienia"],
        [401, "Nie masz uprawnienia"], [0, "Brak połączenia"], [500, "kod 500"],
    ])("błąd %s", (status, text) => expect(describeFailure(Number(status), "Uwaga")).toContain(String(text)));
    it("wynik częściowy jest ostrzeżeniem z uwagą i instrukcją", () => {
        const outcome = describeOutcome("block", "Anna", "PARTIAL", "Dysk pozostał.");
        expect(outcome.variant).toBe("warning");
        expect(outcome.message).toContain("Wykonano tylko częściowo");
        expect(outcome.message).toContain("Dysk pozostał.");
        expect(outcome.message).toContain("Powtórz operację");
        expect(describeOutcome("block", "Anna", "OK", "").variant).toBe("success");
    });
    it.each(["block", "revoke"] as const)("potwierdzenie %s opisuje skutki", action => {
        const content = confirmationContent(action, entry());
        expect(content.paragraphs).toContain("To, co już pobrała na swój komputer (kopia wiedzy, skille), zostaje - zdalnego kasowania nie ma.");
        expect(content.paragraphs.join(" ")).toContain("Anna Nowak - anna@example.com");
        if (action === "revoke") expect(content.paragraphs).toContain("Odebranie kończy dostęp na stałe; ponowne dopuszczenie to nowe zaproszenie.");
    });
    it("przypisuje tylko nieręczne, niepowiązane nadania", () => {
        const rows = [entry(), entry({ statusCode: "INVITED" }), entry({ githubLogin: "anna" }),
            entry({ isGrantedManually: true }), entry({ statusCode: "BLOCKED" }), entry({ statusCode: "REVOKED" })];
        expect(assignableEntries(rows)).toEqual(rows.slice(0, 2));
    });
    it("roleLabel zamienia kod roli na polską nazwę, a nieznaną zostawia", () => {
        expect(roleLabel("ENVI_MANAGER")).toBe("kierownik");
        expect(roleLabel("ENVI_EMPLOYEE")).toBe("pracownik");
        expect(roleLabel("ADMIN")).toBe("ADMIN");
        expect(roleLabel(null)).toBe("brak roli");
    });
    it("describeFailure dla pustej treści 409/422/400 nie zwraca pustego tekstu", () => {
        expect(describeFailure(409, "")).toBe("Nie udało się wykonać operacji (kod 409).");
        expect(describeFailure(422, "Konto zajęte.")).toBe("Konto zajęte.");
    });
});
describe("Poziomy dostępu w widoku", () => {
    it("brak poziomów to same 'brak'; podane poziomy mają polskie nazwy", () => {
        expect(describeLevels(entry())).toEqual({ repos: "brak", psDb: "brak", mail: "brak" });
        expect(describeLevels(entry({ levels: { repos: "write", psDb: "ro", mail: ["faktury", "marek"] } })))
            .toEqual({ repos: "zapis", psDb: "odczyt", mail: "faktury, marek" });
    });
    it("skrzynki: dodanie bez powtórzeń i zdjęcie jednej", () => {
        expect(toggleMailbox(["faktury"], "marek", true)).toEqual(["faktury", "marek"]);
        expect(mailboxChoices(["chocianow-ik", "faktury"], ["faktury", "marek"])).toEqual(["chocianow-ik", "faktury", "marek"]);
        expect(toggleMailbox(["faktury"], "faktury", true)).toEqual(["faktury"]);
        expect(toggleMailbox(["faktury", "marek"], "faktury", false)).toEqual(["marek"]);
    });
    it("grupy tabeli: admin tylko aktywny ze znacznikiem, zaproszeni osobno, reszta w zamkniętych", () => {
        expect(groupKey(entry({ statusCode: "ACTIVE", canManageSb: true }))).toBe("admin");
        expect(groupKey(entry({ statusCode: "ACTIVE" }))).toBe("staff");
        expect(groupKey(entry({ statusCode: "INVITED", canManageSb: true }))).toBe("invited");
        expect(groupKey(entry({ statusCode: "BLOCKED" }))).toBe("closed");
        expect(groupKey(entry({ statusCode: "REVOKED" }))).toBe("closed");
    });
    it("hasła: stan X z Y liczy tylko oczekiwane, kreska gdy nic się nie należy", () => {
        expect(secretsState(entry())).toEqual({ text: "—", tone: "off" });
        expect(secretsState(entry({ secretsExpected: ["poczta-faktury", "baza-ps"], secretsGiven: ["baza-ps", "poczta-stara"] }))).toEqual({ text: "1 z 2", tone: "warn" });
        expect(secretsState(entry({ secretsExpected: ["baza-ps"], secretsGiven: ["baza-ps"] }))).toEqual({ text: "1 z 1", tone: "ok" });
        expect(secretLabel("baza-ps")).toBe("baza PS"); expect(secretLabel("poczta-chocianow-ik")).toBe("poczta: chocianow-ik");
    });
    it("hasło: puste i dłuższe niż mieści RSA-OAEP 2048 (190 bajtów UTF-8) odrzucone", () => {
        expect(secretInputError("")).toBe("Wpisz hasło.");
        expect(secretInputError("a".repeat(190))).toBeNull();
        expect(secretInputError("ż".repeat(96))).toMatch(/za długie/);
    });
});
const NOW = new Date(2026, 9, 19, 12, 0);
const health = (over: Partial<SbHealth> = {}): SbHealth => ({
    reportedAt: new Date(2026, 9, 19, 8, 12).toISOString(), state: "ok", stale: false, refreshRequested: false,
    sbVersion: "1.14", installerVersion: "0.16.0", tools: [{ name: "dysk", ok: true }], events: [], ...over,
});
describe("Komputer - kolumna i panel", () => {
    it("cztery stany kolumny: nie zainstalowano, działa, błąd, brak raportu (szary po 7 dniach wg PS)", () => {
        expect(healthColumn(entry(), NOW)).toEqual({ text: "nie zainstalowano", tone: "off", date: null });
        expect(healthColumn(entry({ health: health() }), NOW)).toEqual({ text: "działa", tone: "ok", date: "dziś 08:12" });
        const failedAt = new Date(2026, 9, 18, 17, 40).toISOString();
        expect(healthColumn(entry({ health: health({ state: "fail", reportedAt: failedAt }) }), NOW)).toEqual({ text: "błąd", tone: "bad", date: "18.10 17:40" });
        const oldAt = new Date(2026, 9, 10, 9, 5).toISOString();
        // Szarość rozstrzyga PS (stale): nawet raport z błędem jest wtedy "brak raportu", ale z datą.
        expect(healthColumn(entry({ health: health({ state: "fail", stale: true, reportedAt: oldAt }) }), NOW)).toEqual({ text: "brak raportu", tone: "off", date: "10.10 09:05" });
    });
    it("data: dziś z godziną, inny dzień z dniem i miesiącem, śmieci jako pusty tekst", () => {
        expect(formatHealthDate(new Date(2026, 9, 19, 0, 5).toISOString(), NOW)).toBe("dziś 00:05");
        expect(formatHealthDate(new Date(2026, 9, 1, 23, 59).toISOString(), NOW)).toBe("01.10 23:59");
        expect(formatHealthDate("nie-data", NOW)).toBe("");
    });
    it("wersje, nazwy narzędzi i prawo do prośby", () => {
        expect(healthVersions(health(), NOW)).toBe("SB 1.14 · instalator 0.16.0 · raport dziś 08:12");
        expect(healthVersions(health({ sbVersion: null, installerVersion: null }), NOW)).toContain("SB ? · instalator ?");
        expect(healthToolLabel("poczta-faktury")).toBe("poczta: faktury");
        expect(healthToolLabel("baza-ps")).toBe("baza PS");
        expect(healthToolLabel("dysk")).toBe("dysk");
        expect(canRequestHealth(entry())).toBe(true);
        expect(canRequestHealth(entry({ statusCode: "BLOCKED" }))).toBe(false);
    });
});

 it("konto techniczne ma ten sam polski podpis w sekretach i raporcie zdrowia", async () => {
    const { secretLabel, healthToolLabel } = await import("../sbManageView");
    expect(secretLabel("poczta-sb-agent")).toBe("konto techniczne poczty (agent)");
    expect(healthToolLabel("poczta-sb-agent")).toBe("konto techniczne poczty (agent)");
 });

describe("Hasła wspólne i ich stan na komputerze", () => {
    it("nazwy i osoby pochodzą z secretsExpected, domyślnie czekający z pełnym kluczem", () => {
        const keyed = { publicKeyJwk: { kty: "RSA", n: "n", e: "AQAB" } as const, keyThumbprint: "thumb" };
        const rows = [entry({ personId: 1, ...keyed, secretsExpected: ["baza-ps", "poczta-faktury"] }),
            entry({ personId: 2, ...keyed, secretsExpected: ["baza-ps"], secretsGiven: ["baza-ps"] }),
            entry({ personId: 3, secretsExpected: ["baza-ps"] }),
            entry({ personId: 4, publicKeyJwk: keyed.publicKeyJwk, secretsExpected: ["baza-ps"] }),
            entry({ personId: 5, keyThumbprint: "thumb", secretsExpected: ["baza-ps"] }),
            entry({ personId: 6, ...keyed, secretsGiven: ["poczta-stara"] })];
        expect(sharedSecretNames(rows)).toEqual(["baza-ps", "poczta-faktury"]);
        expect(secretRecipients(rows, "baza-ps").map(entry => entry.personId)).toEqual([1, 2, 3, 4, 5]);
        expect(defaultSecretRecipients(rows, "baza-ps")).toEqual([1]);
        expect(defaultSecretRecipients(rows, "baza-ps", true)).toEqual([1, 2]);
        expect(secretRecipients(rows, "nieznane")).toEqual([]);
        expect(canReceiveSecret(rows[3])).toBe(false);
        expect(sharedSecretNames([])).toEqual([]);
    });
    it("potwierdzenie porównuje dokładną treść, zachowuje limit bajtów, licznik liczy znaki", () => {
        expect(secretConfirmationError("", "")).toBe("Wpisz hasło.");
        expect(secretConfirmationError("abc", "abcd")).toMatch(/Hasła różnią się/);
        expect(secretConfirmationError("abc ", "abc")).toMatch(/Hasła różnią się/);
        expect(secretConfirmationError("ż".repeat(96), "ż".repeat(96))).toMatch(/za długie/);
        expect(secretConfirmationError(" abc ", " abc ")).toBeNull();
        expect(secretCharacterCount("a".repeat(14))).toBe("Liczba znaków: 14");
        expect(secretCharacterCount("ż🔑")).toBe("Liczba znaków: 2");
        expect(secretCharacterCount("")).toBe("Liczba znaków: 0");
    });
    it("hasła na komputerze: etykieta, brak narzędzia, data, odrzucenie i stary raport", () => {
        expect(healthToolLabel("hasla-z-ps")).toBe("Hasła z PS na komputerze");
        expect(secretHealthState(undefined, NOW)).toBeNull();
        expect(secretHealthState(health(), NOW)).toBeNull();
        expect(secretHealthState(health({ tools: [{ name: "hasla-z-ps", ok: true }] }), NOW))
            .toEqual({ text: "działają na komputerze (raport dziś 08:12)", tone: "ok" });
        const failed = health({ tools: [{ name: "hasla-z-ps", ok: false, error: "baza PS: hasło z PS odrzucone przez serwer, zostało poprzednie" }] });
        expect(secretHealthState(failed, NOW)?.text).toContain("odrzucone przez serwer, zostało poprzednie (raport dziś 08:12)");
        expect(secretHealthState(failed, NOW)?.tone).toBe("bad");
        expect(secretHealthState({ ...failed, stale: true }, NOW)?.tone).toBe("off");
        expect(secretHealthState(health({ tools: [{ name: "hasla-z-ps", ok: false }] }), NOW)?.text).toContain("Nie udało się pobrać lub sprawdzić haseł");
    });
    it("mapa agenta: kolor stanu i polska nazwa klasy trasy", () => {
        expect(["ma", "nie ma", "agent tego nie robi"].map(state => agentStateTone(state as never))).toEqual(["ok", "off", "warn"]);
        expect(routeAccessLabel("zamkniete")).toBe("zamknięte");
        expect(routeAccessLabel("odczyt")).toBe("odczyt");
    });
});
