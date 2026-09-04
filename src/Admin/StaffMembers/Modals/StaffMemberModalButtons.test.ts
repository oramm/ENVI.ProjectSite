/**
 * PER-1: panel „Personel i uprawnienia" zapisuje konto (rola, e-mail systemowy, FIDman)
 * tą samą trasą v2 co ekran użytkowników - po flagach, przed przypisaniami projektów.
 *
 * Testujemy wyciągnięty handler `onEdit`, bo to w nim siedzi pułapka: odpowiedź serwera
 * na zapis flag NIE niesie pól formularza, więc wartości konta muszą przyjść drugim
 * argumentem (`submitted`), a wiersz listy trzeba podmienić w repozytorium.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// MainSetup zostaje prawdziwy: moduł przycisków ciągnie selektory, które czytają
// z niego słowniki przy imporcie - uboga atrapa wywraca import, nie test.
vi.mock("../../../React/Tools/ToolsFetch", () => ({
    default: { fetchJsonWithSafeError: vi.fn() },
}));
vi.mock("../../../Persons/personsV2Helpers", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../Persons/personsV2Helpers")>();
    return {
        ...actual,
        saveProjectAssignments: vi.fn(),
        savePersonV2AccountAndProfile: vi.fn(),
    };
});
const repositoryMock = vi.hoisted(() => ({
    replaceItemById: vi.fn(),
    replaceCurrentItemById: vi.fn(),
    saveToSessionStorage: vi.fn(),
}));
vi.mock("../StaffMembersController", () => ({ staffMembersRepository: repositoryMock }));
// Odczyt wiersza po zapisie (D-PER-8) - domyślnie „nie udało się", żeby dawne testy
// scalania nadal opisywały ścieżkę zapasową.
const fetchRowMock = vi.hoisted(() => vi.fn());
vi.mock("./UserModalButtons", () => ({ fetchStaffMemberRow: fetchRowMock }));

import { saveProjectAssignments, savePersonV2AccountAndProfile } from "../../../Persons/personsV2Helpers";
import {
    makeStaffMemberEditHandler,
    mergeAccountIntoRow,
    OWN_ROLE_CHANGE_MESSAGE,
    ownRoleChangeLogout,
    saveStaffMemberAccountData,
} from "./StaffMemberModalButtons";

const saveAssignments = saveProjectAssignments as unknown as ReturnType<typeof vi.fn>;
const saveV2 = savePersonV2AccountAndProfile as unknown as ReturnType<typeof vi.fn>;

const PERSON_ID = 617;
const CONTRACT_WORKER = 6;

/** Odpowiedź serwera na PUT /admin/staffMember - świeży odczyt wiersza, BEZ pól formularza. */
const serverRow = {
    id: PERSON_ID,
    personId: PERSON_ID,
    isDriver: false,
    isInScrum: true,
    hasCostInvoiceAccess: false,
    hasBankAccess: false,
    canLogSiteVisits: false,
    isActive: true,
    _personName: "test",
    _personSurname: "rola 7",
    _systemRoleId: 6,
    _systemEmail: "stary@envi.com.pl",
    _fidmanEnabled: false,
    _hasStaffRow: true,
} as any;

/** Obiekt wysłany na serwer: wiersz scalony z formularzem. */
const submitted = {
    ...serverRow,
    systemRoleId: 3,
    systemEmail: "nowy@envi.com.pl",
    fidmanEnabled: true,
    _projectAssignments: [],
} as any;

const savedAccount = { personId: PERSON_ID, systemRoleId: 3, systemEmail: "nowy@envi.com.pl", fidmanEnabled: true };

beforeEach(() => {
    saveAssignments.mockReset().mockResolvedValue(undefined);
    saveV2.mockReset().mockResolvedValue({ account: savedAccount, profile: null, errors: [] });
    repositoryMock.replaceItemById.mockReset();
    repositoryMock.replaceCurrentItemById.mockReset();
    repositoryMock.saveToSessionStorage.mockReset();
    fetchRowMock.mockReset().mockResolvedValue(null);
});

describe("saveStaffMemberAccountData - konto trasą v2, potem przypisania", () => {
    it("wysyła rolę, e-mail i flagę FIDmana JAWNIE, także gdy odznaczona", async () => {
        await saveStaffMemberAccountData(PERSON_ID, { systemRoleId: 3, systemEmail: "a@envi.com.pl", fidmanEnabled: false });

        expect(saveV2).toHaveBeenCalledWith(
            PERSON_ID,
            { systemRoleId: 3, systemEmail: "a@envi.com.pl", fidmanEnabled: false },
            {},
            "StaffMembers"
        );
    });

    it("zaznaczony FIDman jedzie jako true", async () => {
        await saveStaffMemberAccountData(PERSON_ID, { systemRoleId: 3, systemEmail: "a@envi.com.pl", fidmanEnabled: true });

        expect(saveV2.mock.calls[0][1]).toMatchObject({ fidmanEnabled: true });
    });

    it("kolejność: najpierw konto, potem przypisania - z wartościami formularza", async () => {
        const calls: string[] = [];
        saveV2.mockImplementation(async () => {
            calls.push("account");
            return { account: savedAccount, profile: null, errors: [] };
        });
        saveAssignments.mockImplementation(async () => {
            calls.push("assignments");
        });

        await saveStaffMemberAccountData(PERSON_ID, {
            systemRoleId: CONTRACT_WORKER,
            _projectAssignments: [{ ourId: "AQM" }],
        });

        expect(calls).toEqual(["account", "assignments"]);
        expect(saveAssignments).toHaveBeenCalledWith({
            id: PERSON_ID,
            systemRoleId: CONTRACT_WORKER,
            _projectAssignments: [{ ourId: "AQM" }],
        });
    });

    it("błąd konta (np. 400 bez e-maila) wraca w liście, a przypisania i tak idą", async () => {
        saveV2.mockResolvedValue({
            account: null,
            profile: null,
            errors: ["Konto systemowe: Użytkownik FIDmana musi mieć e-mail systemowy."],
        });

        const result = await saveStaffMemberAccountData(PERSON_ID, { systemRoleId: 3, fidmanEnabled: true });

        expect(result.account).toBeNull();
        expect(result.errors).toEqual(["Konto systemowe: Użytkownik FIDmana musi mieć e-mail systemowy."]);
        expect(saveAssignments).toHaveBeenCalled();
    });

    it("padnięte przypisania są raportowane, nie rzucane", async () => {
        saveAssignments.mockRejectedValue(new Error("Brak dostępu do projektu AQM"));

        const result = await saveStaffMemberAccountData(PERSON_ID, { systemRoleId: CONTRACT_WORKER, _projectAssignments: [] });

        expect(result.errors).toEqual(["Przypisania projektów: Brak dostępu do projektu AQM"]);
        expect(result.account).toEqual(savedAccount);
    });
});

describe("mergeAccountIntoRow", () => {
    it("konto z odpowiedzi v2 nadpisuje rolę, e-mail i FIDmana w wierszu", () => {
        const row = mergeAccountIntoRow(serverRow, savedAccount);

        expect(row).toMatchObject({ _systemRoleId: 3, _systemEmail: "nowy@envi.com.pl", _fidmanEnabled: true });
        // Flagi z odpowiedzi na zapis flag zostają nietknięte.
        expect(row.isInScrum).toBe(true);
    });

    it("bez konta (zapis padł) wiersz zostaje taki, jaki wrócił z serwera", () => {
        expect(mergeAccountIntoRow(serverRow, null)).toBe(serverRow);
    });
});

describe("handler onEdit modalu uprawnień", () => {
    it("bierze wartości konta z `submitted`, nie z odpowiedzi serwera", async () => {
        const onEdit = vi.fn();
        await makeStaffMemberEditHandler(onEdit)(serverRow, submitted);

        expect(saveV2).toHaveBeenCalledWith(
            PERSON_ID,
            { systemRoleId: 3, systemEmail: "nowy@envi.com.pl", fidmanEnabled: true },
            {},
            "StaffMembers"
        );
        expect(saveAssignments).toHaveBeenCalledWith({ id: PERSON_ID, systemRoleId: 3, _projectAssignments: [] });
    });

    it("podmienia wiersz w repozytorium i oddaje liście wiersz z nowym kontem", async () => {
        const onEdit = vi.fn();
        await makeStaffMemberEditHandler(onEdit)(serverRow, submitted);

        const expectedRow = expect.objectContaining({
            id: PERSON_ID,
            _systemRoleId: 3,
            _systemEmail: "nowy@envi.com.pl",
            _fidmanEnabled: true,
        });
        expect(repositoryMock.replaceItemById).toHaveBeenCalledWith(PERSON_ID, expectedRow);
        expect(repositoryMock.replaceCurrentItemById).toHaveBeenCalledWith(PERSON_ID, expectedRow);
        expect(repositoryMock.saveToSessionStorage).toHaveBeenCalled();
        expect(onEdit).toHaveBeenCalledWith(expectedRow);
    });

    it("po błędzie konta odświeża listę stanem z serwera, a potem rzuca - modal zostaje otwarty", async () => {
        saveV2.mockResolvedValue({
            account: null,
            profile: null,
            errors: ["Konto systemowe: Użytkownik FIDmana musi mieć e-mail systemowy."],
        });
        const onEdit = vi.fn();

        await expect(makeStaffMemberEditHandler(onEdit)(serverRow, submitted)).rejects.toThrow(
            /Uprawnienia zapisano[\s\S]*musi mieć e-mail systemowy/
        );
        // Flagi są już w bazie - lista ma je pokazać mimo błędu konta.
        expect(onEdit).toHaveBeenCalledWith(serverRow);
        expect(repositoryMock.replaceItemById).not.toHaveBeenCalled();
    });

    it("bez `submitted` NIE zapisuje konta i mówi o tym wprost", async () => {
        // Wysłanie domyślnych wartości formularza wyłączyłoby komuś FIDmana po cichu.
        const onEdit = vi.fn();

        await expect(makeStaffMemberEditHandler(onEdit)(serverRow)).rejects.toThrow(/konto NIE/);
        expect(saveV2).not.toHaveBeenCalled();
        expect(onEdit).toHaveBeenCalledWith(serverRow);
    });
});

describe("handler onEdit - świeży odczyt wiersza po zapisie konta (D-PER-8)", () => {
    it("bierze wiersz z serwera, gdy odczyt się uda - to on niesie stan wysyłki do FIDmana", async () => {
        const freshRow = {
            ...serverRow,
            _systemRoleId: 3,
            _systemEmail: "nowy@envi.com.pl",
            _fidmanEnabled: true,
            _fidmanSync: {
                status: "FAILED",
                requestedEnabled: true,
                skipReason: null,
                skipReasonLabel: null,
                lastError: "FIDMAN_SYNC_BASE_URL nie ustawione",
                attempts: 1,
                updatedAt: null,
            },
        };
        fetchRowMock.mockResolvedValue(freshRow);
        const onEdit = vi.fn();

        await makeStaffMemberEditHandler(onEdit)(serverRow, submitted);

        expect(fetchRowMock).toHaveBeenCalledWith(PERSON_ID);
        expect(repositoryMock.replaceItemById).toHaveBeenCalledWith(PERSON_ID, freshRow);
        expect(onEdit).toHaveBeenCalledWith(freshRow);
    });

    it("gdy odczyt padnie, scala konto jak dawniej - błąd odczytu nie przykrywa zapisu", async () => {
        fetchRowMock.mockRejectedValue(new Error("sieć"));
        const onEdit = vi.fn();

        await makeStaffMemberEditHandler(onEdit)(serverRow, submitted);

        expect(onEdit).toHaveBeenCalledWith(
            expect.objectContaining({ _systemEmail: "nowy@envi.com.pl", _fidmanEnabled: true }),
        );
    });
});

describe("zmiana WŁASNEJ roli (D-PER-10) - serwer skasował sesję wołającego", () => {
    const revokedAccount = { ...savedAccount, _selfSessionRevoked: true };

    beforeEach(() => {
        ownRoleChangeLogout.notify = vi.fn();
        ownRoleChangeLogout.reload = vi.fn();
        sessionStorage.setItem("Current User", JSON.stringify({ systemRoleName: "ADMIN" }));
    });

    it("po zapisie konta nie wysyła przypisań - poszłyby w 401 i przeładowały stronę bez słowa", async () => {
        saveV2.mockResolvedValue({ account: revokedAccount, profile: null, errors: [] });

        const result = await saveStaffMemberAccountData(PERSON_ID, submitted);

        expect(result.selfSessionRevoked).toBe(true);
        expect(saveAssignments).not.toHaveBeenCalled();
    });

    it("handler zamyka okno, mówi człowiekowi, co się stało, czyści pamięć sesji i przechodzi do logowania", async () => {
        saveV2.mockResolvedValue({ account: revokedAccount, profile: null, errors: [] });
        const onEdit = vi.fn();

        await makeStaffMemberEditHandler(onEdit)(serverRow, submitted);

        expect(fetchRowMock).not.toHaveBeenCalled();
        expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: PERSON_ID, _systemRoleId: 3 }));
        expect(ownRoleChangeLogout.notify).toHaveBeenCalledWith(OWN_ROLE_CHANGE_MESSAGE);
        expect(sessionStorage.getItem("Current User")).toBeNull();
        expect(ownRoleChangeLogout.reload).toHaveBeenCalledTimes(1);
    });

    it("zwykły zapis (bez znacznika) nie wylogowuje", async () => {
        const onEdit = vi.fn();

        await makeStaffMemberEditHandler(onEdit)(serverRow, submitted);

        expect(ownRoleChangeLogout.notify).not.toHaveBeenCalled();
        expect(ownRoleChangeLogout.reload).not.toHaveBeenCalled();
    });
});
