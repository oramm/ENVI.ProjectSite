import { describe, expect, it } from "vitest";
import type { SbEntry } from "../sbManageApi";
import { assignableEntries, availableActions, confirmationContent, describeDrive, describeFailure, describeGithub, describeOutcome, roleLabel, statusViews } from "../sbManageView";

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
