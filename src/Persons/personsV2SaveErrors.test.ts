/**
 * Zapis konta v2 vs. widoczność błędu.
 *
 * `savePersonV2AccountAndProfile` celowo NIE rzuca - zbiera błędy w tablicy, bo wywołujący
 * musi najpierw odświeżyć listę danymi legacy (te zapisały się poprawnie), a dopiero potem
 * pokazać, czego nie udało się dopisać. Za samo rzucenie odpowiada `throwOnSaveErrors`.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

const hoisted = vi.hoisted(() => ({
    fetchJsonWithSafeError: vi.fn(),
}));

vi.mock("../React/Tools/ToolsFetch", () => ({
    default: { fetchJsonWithSafeError: hoisted.fetchJsonWithSafeError },
}));
vi.mock("../React/MainSetupReact", () => ({
    default: { serverUrl: "http://localhost:3000/" },
}));

import { savePersonV2AccountAndProfile, throwOnSaveErrors } from "./personsV2Helpers";

const CONFLICT_MESSAGE = "SystemEmail 'anna@envi.com.pl' is already used by another person account.";
const PERSON_ID = 7;

/** Adres z URL-a wywołania - po nim rozpoznajemy, który endpoint dostał żądanie. */
function calledUrls(): string[] {
    return hoisted.fetchJsonWithSafeError.mock.calls.map((call) => String(call[0]));
}

describe("savePersonV2AccountAndProfile", () => {
    beforeEach(() => {
        hoisted.fetchJsonWithSafeError.mockReset().mockResolvedValue({});
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("zwraca błąd konta, gdy serwer odrzuci zapis SystemEmail", async () => {
        hoisted.fetchJsonWithSafeError.mockImplementation(async (url: string) => {
            if (url.endsWith("/account")) throw new Error(CONFLICT_MESSAGE);
            return {};
        });

        const result = await savePersonV2AccountAndProfile(
            PERSON_ID,
            { systemEmail: "anna@envi.com.pl", fidmanEnabled: false },
            {},
            "SystemUsers"
        );

        expect(result.errors).toEqual([`Konto systemowe: ${CONFLICT_MESSAGE}`]);
        expect(result.account).toBeNull();
    });

    it("błąd konta nie blokuje zapisu profilu - oba idą, oba są raportowane osobno", async () => {
        hoisted.fetchJsonWithSafeError.mockImplementation(async (url: string) => {
            if (url.endsWith("/account")) throw new Error(CONFLICT_MESSAGE);
            return { headline: "ok" };
        });

        const result = await savePersonV2AccountAndProfile(
            PERSON_ID,
            { fidmanEnabled: true },
            { headline: "ok" },
            "SystemUsers"
        );

        expect(result.errors).toHaveLength(1);
        expect(result.profile).toEqual({ headline: "ok" });
    });

    it("udany zapis nie zwraca żadnych błędów", async () => {
        const result = await savePersonV2AccountAndProfile(PERSON_ID, { fidmanEnabled: true }, {}, "SystemUsers");

        expect(result.errors).toEqual([]);
    });

    it("pusty payload konta NIE wysyła PUT - serwer odrzuca taki zapis jako 400", async () => {
        // Moduł Persons woła zapis z pustym `{}` przy każdej edycji osoby. Gdyby żądanie
        // poszło, każdy zapis osoby kończyłby się teraz czerwonym paskiem w modalu.
        const result = await savePersonV2AccountAndProfile(PERSON_ID, {}, {}, "Persons");

        expect(calledUrls().some((url) => url.endsWith("/account"))).toBe(false);
        expect(result.errors).toEqual([]);
    });

    it("pusty payload profilu też NIE wysyła PUT - zakładał tylko pusty wiersz", async () => {
        // Wiersz PersonProfiles powstaje leniwie przy pierwszym realnym wpisie
        // (wykształcenie/doświadczenie/umiejętność), więc zakładanie go "na zapas"
        // przy każdej edycji osoby to zapis bez treści.
        await savePersonV2AccountAndProfile(PERSON_ID, {}, {}, "Persons");

        expect(calledUrls().some((url) => url.endsWith("/profile"))).toBe(false);
        expect(calledUrls()).toEqual([]);
    });

    it("profil Z treścią nadal leci - guard blokuje tylko pusty payload", async () => {
        await savePersonV2AccountAndProfile(PERSON_ID, {}, { headline: "Projektant" }, "Persons");

        expect(calledUrls().some((url) => url.endsWith("/profile"))).toBe(true);
    });

    it("payload z samym `fidmanEnabled: false` to nadal dane do zapisania", async () => {
        // Odznaczenie checkboxa jest zmianą - nie wolno go potraktować jak pustego payloadu.
        await savePersonV2AccountAndProfile(PERSON_ID, { fidmanEnabled: false }, {}, "SystemUsers");

        expect(calledUrls().some((url) => url.endsWith("/account"))).toBe(true);
    });

    it("payload z samymi `undefined` traktujemy jak pusty", async () => {
        await savePersonV2AccountAndProfile(
            PERSON_ID,
            { systemRoleId: undefined, systemEmail: undefined },
            {},
            "Persons"
        );

        expect(calledUrls().some((url) => url.endsWith("/account"))).toBe(false);
    });
});

describe("throwOnSaveErrors", () => {
    it("nie rzuca, gdy nic nie padło", () => {
        expect(() => throwOnSaveErrors([])).not.toThrow();
    });

    it("rzuca z treścią błędu serwera - to ona ląduje w pasku błędu modala", () => {
        expect(() => throwOnSaveErrors([`Konto systemowe: ${CONFLICT_MESSAGE}`])).toThrow(CONFLICT_MESSAGE);
    });

    it("mówi wprost, że dane osoby zapisano, a reszty nie", () => {
        // Bez tego zdania użytkownik nie wie, czy powtarzać cały zapis, czy tylko konto.
        expect(() => throwOnSaveErrors(["Konto systemowe: cokolwiek"])).toThrow(/Dane osoby zapisano/);
    });

    it("skleja wszystkie błędy w jeden komunikat", () => {
        expect(() => throwOnSaveErrors(["Konto systemowe: A", "Przypisania projektów: B"])).toThrow(/A[\s\S]*B/);
    });
});
