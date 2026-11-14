import { describe, expect, it } from "vitest";
import MainSetup from "./MainSetupReact";

/**
 * Kręgi zewnętrzne (plan DOSTEP, etap 1). Listy są lustrem backendu: PROJECT_SCOPED_ROLES
 * (src/setup/Sessions/projectScopedPolicy.ts) i NO_PROJECT_MAIL_ROLES
 * (src/mailboxes/mailboxAccessPolicy.ts). Repozytoria są osobne, więc rozjazd złapie tylko test.
 */
describe("role ograniczone do przypisań (DOSTEP-1)", () => {
    it("ograniczone są cztery role zewnętrzne; pracownicy ENVI nie", () => {
        expect(MainSetup.PROJECT_SCOPED_ROLES).toEqual(["CONTRACT_WORKER", "CLIENT", "ENVI_COOPERATOR", "EXTERNAL_USER"]);
        for (const role of MainSetup.STAFF_ROLES) expect(MainSetup.PROJECT_SCOPED_ROLES).not.toContain(role);
    });

    it("współpracownik ma pocztę projektu - bez poczty są tylko pracownik kontraktowy i klient (D7)", () => {
        expect(MainSetup.NO_PROJECT_MAIL_ROLES).toEqual(["CONTRACT_WORKER", "CLIENT"]);
        expect(MainSetup.isProjectScopedRoleId(MainSetup.SystemRoles.ENVI_COOPERATOR.id)).toBe(false);
        expect(MainSetup.isProjectScopedRoleId(MainSetup.SystemRoles.CONTRACT_WORKER.id)).toBe(true);
    });

    it("kontrakty w menu widzi współpracownik, a użytkownik zewnętrzny nie (serwer daje mu tylko pisma)", () => {
        expect(MainSetup.CONTRACT_SCOPED_ROLES).toContain("ENVI_COOPERATOR");
        expect(MainSetup.CONTRACT_SCOPED_ROLES).not.toContain("EXTERNAL_USER");
        expect(MainSetup.LETTERS_READ_ONLY_ROLES).toEqual(["EXTERNAL_USER"]);
        expect(MainSetup.CONTRACT_SCOPED_ROLES).toEqual(expect.arrayContaining([...MainSetup.STAFF_ROLES, "CONTRACT_WORKER", "CLIENT"]));
    });

    it("oferty i faktury sprzedaży tylko dla pracowników ENVI", () => {
        expect(MainSetup.STAFF_ROLES).toEqual(["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"]);
    });
});
