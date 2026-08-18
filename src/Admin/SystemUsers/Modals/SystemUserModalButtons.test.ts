import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../../Persons/personsV2Helpers", () => ({
    savePersonProjectAssignments: vi.fn(),
    savePersonV2AccountAndProfile: vi.fn(),
}));

import { savePersonProjectAssignments, savePersonV2AccountAndProfile } from "../../../Persons/personsV2Helpers";
import {
    SYSTEM_USER_PERSON_EDIT_FIELDS,
    buildAccountPayload,
    saveProjectAssignments,
    saveSystemUserAccountData,
} from "./SystemUserModalButtons";

const save = savePersonProjectAssignments as unknown as ReturnType<typeof vi.fn>;
const saveV2 = savePersonV2AccountAndProfile as unknown as ReturnType<typeof vi.fn>;
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

        expect(payload).toMatchObject({ fidmanEnabled: true });
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

    /**
     * STRAŻNIK REGRESJI. Payload musi nieść rolę i e-mail systemowy, choćby wyglądały
     * na zdublowane z legacy `PUT /person/:id`. Przy DODAWANIU legacy ich nie zapisuje:
     * `PersonsController.addFromDto` kasuje oba pola przed zapisem, więc konto zakłada
     * wyłącznie to wywołanie v2. Okrojenie payloadu = nowy użytkownik bez roli i bez
     * e-maila, czyli konto bez możliwości zalogowania.
     */
    it("niesie rolę i email systemowy - przy dodawaniu to JEDYNY zapis konta", () => {
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

/**
 * Domknięcie zapisu użytkownika systemu zwraca listę błędów zamiast je połykać.
 * Wcześniej wynik `savePersonV2AccountAndProfile` nie był w ogóle czytany, więc konflikt
 * SystemEmail kończył się zamkniętym modalem i przekonaniem, że konto się zapisało.
 */
describe("saveSystemUserAccountData - błędy wracają do wywołującego", () => {
    const CONFLICT = "Konto systemowe: SystemEmail 'anna@envi.com.pl' is already used by another person account.";

    beforeEach(() => {
        save.mockReset().mockResolvedValue([]);
        saveV2.mockReset().mockResolvedValue({ account: {}, profile: {}, errors: [] });
    });

    it("oddaje błąd zapisu konta zamiast go zgubić", async () => {
        saveV2.mockResolvedValue({ account: null, profile: {}, errors: [CONFLICT] });

        const errors = await saveSystemUserAccountData({ id: 7, systemRoleId: "2", fidmanEnabled: true } as any);

        expect(errors).toEqual([CONFLICT]);
    });

    it("udany zapis nie zwraca błędów i niesie komplet pól konta", async () => {
        const errors = await saveSystemUserAccountData({
            id: 7,
            systemRoleId: "2",
            systemEmail: "anna@envi.com.pl",
            fidmanEnabled: true,
        } as any);

        expect(errors).toEqual([]);
        expect(saveV2).toHaveBeenCalledWith(
            7,
            { systemRoleId: 2, systemEmail: "anna@envi.com.pl", fidmanEnabled: true },
            {},
            "SystemUsers"
        );
    });

    it("padnięte przypisania projektów też są raportowane, a nie rzucane dalej", async () => {
        // Rzucenie tutaj ominęłoby callback odświeżający listę - dane legacy są już w bazie
        // i lista ma je pokazać, nawet gdy domknięcie się nie udało.
        save.mockRejectedValue(new Error("Brak dostępu do projektu AQM"));

        const errors = await saveSystemUserAccountData({
            id: 7,
            systemRoleId: CONTRACT_WORKER,
            _projectAssignments: [{ ourId: "AQM" }],
        } as any);

        expect(errors).toEqual(["Przypisania projektów: Brak dostępu do projektu AQM"]);
    });

    it("bez id nie próbuje niczego zapisywać", async () => {
        const errors = await saveSystemUserAccountData({ systemRoleId: "2" } as any);

        expect(errors).toEqual([]);
        expect(saveV2).not.toHaveBeenCalled();
    });
});

describe("SYSTEM_USER_PERSON_EDIT_FIELDS - legacy nie zapisuje konta", () => {
    it("nie niesie zadnego pola konta", () => {
        // Gdyby ktore z tych pol tu wrocilo, legacy PUT /person pisalby konto rownolegle
        // z trasa v2 - a tylko v2 kolejkuje push do FIDmana i uniewaznia sesje po zmianie roli.
        expect(SYSTEM_USER_PERSON_EDIT_FIELDS).not.toContain("systemRoleId");
        expect(SYSTEM_USER_PERSON_EDIT_FIELDS).not.toContain("systemEmail");
        expect(SYSTEM_USER_PERSON_EDIT_FIELDS).not.toContain("fidmanEnabled");
    });

    it("jest niepusta", () => {
        // Pusta tablica to NIE to samo co brak pol konta: editFromDto wraca wtedy do
        // DEFAULT_EDIT_FIELDS, czyli legacy po cichu znowu zapisuje role i e-mail.
        expect(SYSTEM_USER_PERSON_EDIT_FIELDS.length).toBeGreaterThan(0);
    });

    it("niesie komplet pol osoby, ktore modal edytuje", () => {
        expect(SYSTEM_USER_PERSON_EDIT_FIELDS).toEqual([
            "name",
            "surname",
            "position",
            "email",
            "cellphone",
            "phone",
            "comment",
        ]);
    });
});
