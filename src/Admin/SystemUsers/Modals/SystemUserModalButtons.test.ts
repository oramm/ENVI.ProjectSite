import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../../Persons/personsV2Helpers", () => ({
    savePersonProjectAssignments: vi.fn(),
    savePersonV2AccountAndProfile: vi.fn(),
}));

import { savePersonProjectAssignments } from "../../../Persons/personsV2Helpers";
import { buildAccountPayload, saveProjectAssignments } from "./SystemUserModalButtons";

const save = savePersonProjectAssignments as unknown as ReturnType<typeof vi.fn>;
const CONTRACT_WORKER = 6;
const CLIENT = 7;

describe("buildAccountPayload - flaga uzytkownika FIDmana (GLO-P1)", () => {
    it("zaznaczony checkbox jedzie do payloadu konta jako true", () => {
        const payload = buildAccountPayload({
            id: 7,
            systemRoleId: "2",
            systemEmail: "anna@envi.com.pl",
            fidmanEnabled: true,
        } as any);

        expect(payload).toMatchObject({
            systemRoleId: 2,
            systemEmail: "anna@envi.com.pl",
            fidmanEnabled: true,
        });
    });

    it("odznaczony jedzie jako false, a NIE znika z payloadu", () => {
        // Brak pola serwer czyta jako "nie ruszaj flagi", więc pominięcie false
        // sprawiłoby, że odznaczenia nie da się zapisać.
        const payload = buildAccountPayload({
            id: 7,
            systemRoleId: "2",
            systemEmail: "anna@envi.com.pl",
            fidmanEnabled: false,
        } as any);

        expect(payload.fidmanEnabled).toBe(false);
        expect("fidmanEnabled" in payload).toBe(true);
    });

    it("formularz bez tego pola zapisuje flage jako wylaczona, a nie undefined", () => {
        const payload = buildAccountPayload({ id: 7, systemRoleId: "2" } as any);

        expect(payload.fidmanEnabled).toBe(false);
    });
});

describe("saveProjectAssignments", () => {
    beforeEach(() => save.mockReset());

    it("zapisuje wybrane projekty pracownika kontraktowego", async () => {
        await saveProjectAssignments({
            id: 7,
            systemRoleId: CONTRACT_WORKER,
            _projectAssignments: [{ ourId: "AQM" }, { ourId: "2023.10" }],
        } as any);

        expect(save).toHaveBeenCalledWith(7, ["AQM", "2023.10"]);
    });

    it("NIE kasuje przypisań, gdy pole nie dotarło", async () => {
        // Tak wyglądał błąd z produkcji: gdy odpowiedź serwera nie niosła
        // _projectAssignments, pusta lista czyściła tabelę PersonProjects.
        // Serwerowy model Person przenosi to pole (jak _entity), ale gdyby kiedyś
        // przestał, ten guard zamienia utratę danych w brak zapisu.
        await saveProjectAssignments({
            id: 7,
            systemRoleId: CONTRACT_WORKER,
        } as any);

        expect(save).not.toHaveBeenCalled();
    });

    it("pusty wybór to świadome wyczyszczenie - zapisuje pustą listę", async () => {
        await saveProjectAssignments({
            id: 7,
            systemRoleId: CONTRACT_WORKER,
            _projectAssignments: [],
        } as any);

        expect(save).toHaveBeenCalledWith(7, []);
    });

    it("zapisuje wybrane projekty klienta - ta rola też jest zakresowa", async () => {
        await saveProjectAssignments({
            id: 7,
            systemRoleId: CLIENT,
            _projectAssignments: [{ ourId: "AQM" }],
        } as any);

        expect(save).toHaveBeenCalledWith(7, ["AQM"]);
    });

    it("zmiana roli na inną odbiera przypisania", async () => {
        await saveProjectAssignments({
            id: 7,
            systemRoleId: 3,
            _projectAssignments: [{ ourId: "AQM" }],
        } as any);

        expect(save).toHaveBeenCalledWith(7, []);
    });

    it("bez id nie robi nic", async () => {
        await saveProjectAssignments({ systemRoleId: CONTRACT_WORKER } as any);

        expect(save).not.toHaveBeenCalled();
    });
});
