import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../../Persons/personsV2Helpers", () => ({
    savePersonProjectAssignments: vi.fn(),
    savePersonV2AccountAndProfile: vi.fn(),
}));

import { savePersonProjectAssignments } from "../../../Persons/personsV2Helpers";
import { saveProjectAssignments } from "./SystemUserModalButtons";

const save = savePersonProjectAssignments as unknown as ReturnType<typeof vi.fn>;
const CONTRACT_WORKER = 6;

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
