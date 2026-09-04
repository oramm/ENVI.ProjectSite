/**
 * Wspólne funkcje zapisu konta (modal dodawania użytkownika i modal uprawnień w oknie
 * „Personel i uprawnienia"): payload konta v2 z jawną flagą FIDmana oraz domknięcie
 * przypisań projektów. Przeniesione w PER-1 ze skasowanego (PER-5) ekranu „Dodawanie
 * użytkowników" razem z implementacją.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

const hoisted = vi.hoisted(() => ({
    fetchJsonWithSafeError: vi.fn(),
}));

vi.mock("../React/Tools/ToolsFetch", () => ({
    default: { fetchJsonWithSafeError: hoisted.fetchJsonWithSafeError },
}));
vi.mock("../React/MainSetupReact", () => ({
    default: {
        serverUrl: "http://localhost:3000/",
        isProjectScopedRoleId: (id: unknown) => Number(id) === 6 || Number(id) === 7,
    },
}));

import { buildAccountPayload, saveProjectAssignments } from "./personsV2Helpers";

const CONTRACT_WORKER = 6;
const CLIENT = 7;

/** Lista projektów wysłana na trasę przypisań - po jednej na żądanie. */
function sentAssignments(): Array<{ url: string; projectOurIds: string[] }> {
    return hoisted.fetchJsonWithSafeError.mock.calls
        .filter(([url]) => String(url).endsWith("/project-assignments"))
        .map(([url, options]) => ({
            url: String(url),
            projectOurIds: JSON.parse(String((options as RequestInit).body)).projectOurIds,
        }));
}

describe("buildAccountPayload - flaga uzytkownika FIDmana (GLO-P1)", () => {
    it("zaznaczony checkbox jedzie do payloadu konta jako true", () => {
        const payload = buildAccountPayload({
            systemRoleId: "2",
            systemEmail: "anna@envi.com.pl",
            fidmanEnabled: true,
        });

        expect(payload).toMatchObject({ fidmanEnabled: true });
    });

    it("odznaczony jedzie jako false, a NIE znika z payloadu", () => {
        // Brak pola serwer czyta jako "nie ruszaj flagi", więc pominięcie false
        // sprawiłoby, że odznaczenia nie da się zapisać.
        const payload = buildAccountPayload({
            systemRoleId: "2",
            systemEmail: "anna@envi.com.pl",
            fidmanEnabled: false,
        });

        expect(payload.fidmanEnabled).toBe(false);
        expect("fidmanEnabled" in payload).toBe(true);
    });

    it("formularz bez tego pola zapisuje flage jako wylaczona, a nie undefined", () => {
        const payload = buildAccountPayload({ systemRoleId: "2" });

        expect(payload.fidmanEnabled).toBe(false);
    });

    it("rola z Typeahead (liczba) i z legacy (string) daje tę samą liczbę", () => {
        expect(buildAccountPayload({ systemRoleId: 3 }).systemRoleId).toBe(3);
        expect(buildAccountPayload({ systemRoleId: "3" }).systemRoleId).toBe(3);
    });

    it("pusty wybór roli i pusty e-mail nie jadą na serwer (undefined = nie ruszaj)", () => {
        const payload = buildAccountPayload({ systemRoleId: "", systemEmail: "" });

        expect(payload.systemRoleId).toBeUndefined();
        expect(payload.systemEmail).toBeUndefined();
    });

    /**
     * STRAŻNIK REGRESJI. Payload musi nieść rolę i e-mail systemowy, choćby wyglądały
     * na zdublowane z legacy `PUT /person/:id`. Przy DODAWANIU legacy ich nie zapisuje:
     * `PersonsController.addFromDto` kasuje oba pola przed zapisem, więc konto zakłada
     * wyłącznie to wywołanie v2. Okrojenie payloadu = nowy użytkownik bez roli i bez
     * e-maila, czyli konto bez możliwości zalogowania.
     */
    it("niesie rolę i email systemowy - przy dodawaniu to JEDYNY zapis konta", () => {
        const payload = buildAccountPayload({
            systemRoleId: "2",
            systemEmail: "anna@envi.com.pl",
            fidmanEnabled: true,
        });

        expect(payload).toMatchObject({
            systemRoleId: 2,
            systemEmail: "anna@envi.com.pl",
            fidmanEnabled: true,
        });
    });
});

describe("saveProjectAssignments", () => {
    beforeEach(() => {
        hoisted.fetchJsonWithSafeError.mockReset().mockResolvedValue({ assignments: [] });
    });

    it("zapisuje wybrane projekty pracownika kontraktowego", async () => {
        await saveProjectAssignments({
            id: 7,
            systemRoleId: CONTRACT_WORKER,
            _projectAssignments: [{ ourId: "AQM" }, { ourId: "2023.10" }],
        });

        expect(sentAssignments()).toEqual([
            { url: "http://localhost:3000/v2/persons/7/project-assignments", projectOurIds: ["AQM", "2023.10"] },
        ]);
    });

    it("NIE kasuje przypisań, gdy pole nie dotarło", async () => {
        // Tak wyglądał błąd z produkcji: gdy odpowiedź serwera nie niosła
        // _projectAssignments, pusta lista czyściła tabelę PersonProjects.
        // Ten guard zamienia utratę danych w brak zapisu.
        await saveProjectAssignments({ id: 7, systemRoleId: CONTRACT_WORKER });

        expect(sentAssignments()).toEqual([]);
    });

    it("pusty wybór to świadome wyczyszczenie - zapisuje pustą listę", async () => {
        await saveProjectAssignments({ id: 7, systemRoleId: CONTRACT_WORKER, _projectAssignments: [] });

        expect(sentAssignments().map((call) => call.projectOurIds)).toEqual([[]]);
    });

    it("zapisuje wybrane projekty klienta - ta rola też jest zakresowa", async () => {
        await saveProjectAssignments({ id: 7, systemRoleId: CLIENT, _projectAssignments: [{ ourId: "AQM" }] });

        expect(sentAssignments().map((call) => call.projectOurIds)).toEqual([["AQM"]]);
    });

    it("zmiana roli na inną odbiera przypisania", async () => {
        await saveProjectAssignments({ id: 7, systemRoleId: 3, _projectAssignments: [{ ourId: "AQM" }] });

        expect(sentAssignments().map((call) => call.projectOurIds)).toEqual([[]]);
    });

    it("rola jako string z legacy też jest rozpoznawana jako zakresowa", async () => {
        await saveProjectAssignments({ id: 7, systemRoleId: "6", _projectAssignments: [{ ourId: "AQM" }] });

        expect(sentAssignments().map((call) => call.projectOurIds)).toEqual([["AQM"]]);
    });

    it("bez id nie robi nic", async () => {
        await saveProjectAssignments({ systemRoleId: CONTRACT_WORKER });

        expect(hoisted.fetchJsonWithSafeError).not.toHaveBeenCalled();
    });
});
