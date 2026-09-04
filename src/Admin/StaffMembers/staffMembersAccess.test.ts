import { describe, expect, it } from "vitest";
import MainSetup from "../../React/MainSetupReact";

/**
 * Kto widzi okno „Personel i uprawnienia" - jedyne okno do kont i uprawnień po PER-3.
 *
 * Trasa (`/admin/staffMembers`) i pozycja w menu stoją na `ADMIN_PANEL_ROLES`, a serwer
 * bramkuje trasy konta stałą `USER_MANAGEMENT_ROLES` w
 * `PS-nodeJS/src/setup/Sessions/requireUserManagementRole.ts`. Od D-PER-3 (a) obie listy
 * to ADMIN + ENVI_MANAGER. Rozjechanie ich daje albo pozycję w menu prowadzącą w 403,
 * albo funkcję ukrytą w menu i dostępną z ręki wpisanym adresem - a że repozytoria są
 * osobne, żaden kompilator tego nie złapie. Rozstrzyga backend.
 */
describe("dostęp do okna kont i uprawnień (D-PER-3)", () => {
    it("okno jest dla ADMIN i ENVI_MANAGER", () => {
        expect(MainSetup.ADMIN_PANEL_ROLES).toEqual(["ADMIN", "ENVI_MANAGER"]);
    });

    it("pracownik ENVI widzi książkę adresową, ale nie zarządza kontami", () => {
        // Zawężenie z PER-3 dotknęło WYŁĄCZNIE zarządzania kontami. Gdyby przeciekło na
        // STAFF_ROLES, pracownicy straciliby przy okazji okno „Osoby" i moduł ofert.
        expect(MainSetup.ADMIN_PANEL_ROLES).not.toContain("ENVI_EMPLOYEE");
        expect(MainSetup.STAFF_ROLES).toContain("ENVI_EMPLOYEE");
    });
});
