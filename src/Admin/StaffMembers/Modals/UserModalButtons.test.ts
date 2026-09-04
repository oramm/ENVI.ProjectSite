import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Dodawanie użytkownika z okna „Personel i uprawnienia" (pack PER, checkpoint PER-3).
 *
 * `buildAccountPayload` i `saveProjectAssignments` mają własne testy obok implementacji
 * (src/Persons/personsV2AccountHelpers.test.ts). Tu sprawdzamy to, co należy do tego okna:
 * payload konta, kolejność żądań i to, co ląduje w liście po dodaniu.
 *
 * MainSetup zostaje prawdziwy: moduł ciągnie selektory, które czytają z niego słowniki
 * przy imporcie - uboga atrapa wywraca import, nie test.
 */
vi.mock("../../../React/Tools/ToolsFetch", () => ({
    default: {
        fetchWithRetry: vi.fn(),
        fetchJsonWithSafeError: vi.fn(),
        sendClientErrorReport: vi.fn(),
    },
}));
vi.mock("../../../Persons/personsV2Helpers", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../Persons/personsV2Helpers")>();
    return {
        ...actual,
        saveProjectAssignments: vi.fn(),
        savePersonV2AccountAndProfile: vi.fn(),
    };
});

import ToolsFetch from "../../../React/Tools/ToolsFetch";
import { saveProjectAssignments, savePersonV2AccountAndProfile } from "../../../Persons/personsV2Helpers";
import { staffMembersRepository } from "../StaffMembersController";
import { makeUserAddNewHandler, saveNewUserAccountData } from "./UserModalButtons";

const saveAssignments = saveProjectAssignments as unknown as ReturnType<typeof vi.fn>;
const saveV2 = savePersonV2AccountAndProfile as unknown as ReturnType<typeof vi.fn>;
const fetchRow = ToolsFetch.fetchWithRetry as unknown as ReturnType<typeof vi.fn>;

const CONTRACT_WORKER = 6;
const NEW_PERSON_ID = 701;

/** Odpowiedź serwera na odczyt wiersza listy po dodaniu osoby. */
const ROW_FROM_SERVER = {
    id: NEW_PERSON_ID,
    personId: NEW_PERSON_ID,
    isDriver: true,
    isInScrum: false,
    hasCostInvoiceAccess: false,
    hasBankAccess: false,
    canLogSiteVisits: false,
    isActive: true,
    _personName: "Anna",
    _personSurname: "Nowak",
    _systemEmail: "anna@envi.com.pl",
    _systemRoleId: 3,
    _fidmanEnabled: true,
    _hasStaffRow: true,
};

const NEW_USER = {
    id: NEW_PERSON_ID,
    name: "Anna",
    surname: "Nowak",
    systemRoleId: "3",
    systemEmail: "anna@envi.com.pl",
    fidmanEnabled: true,
};

beforeEach(() => {
    saveAssignments.mockReset().mockResolvedValue(undefined);
    saveV2.mockReset().mockResolvedValue({ account: {}, profile: {}, errors: [] });
    fetchRow.mockReset().mockResolvedValue([ROW_FROM_SERVER]);
    staffMembersRepository.items = [];
    staffMembersRepository.currentItems = [];
});

describe("saveNewUserAccountData - domknięcie zapisu nowego użytkownika", () => {
    it("wysyła komplet pól konta trasą v2", async () => {
        // STRAŻNIK REGRESJI: przy zakładaniu to JEDYNY zapis roli i e-maila -
        // `POST /person` wycina pola konta przed zapisem (PersonsController.addFromDto).
        const { errors } = await saveNewUserAccountData(NEW_USER as any);

        expect(errors).toEqual([]);
        expect(saveV2).toHaveBeenCalledWith(
            NEW_PERSON_ID,
            { systemRoleId: 3, systemEmail: "anna@envi.com.pl", fidmanEnabled: true },
            {},
            "StaffMembers"
        );
    });

    it("przypisania projektów idą PO koncie i dostają wartości z formularza", async () => {
        const calls: string[] = [];
        saveV2.mockImplementation(async () => {
            calls.push("account");
            return { account: {}, profile: {}, errors: [] };
        });
        saveAssignments.mockImplementation(async () => {
            calls.push("assignments");
        });

        const person = {
            id: NEW_PERSON_ID,
            systemRoleId: CONTRACT_WORKER,
            _projectAssignments: [{ ourId: "AQM" }],
        };
        await saveNewUserAccountData(person as any);

        expect(calls).toEqual(["account", "assignments"]);
        expect(saveAssignments).toHaveBeenCalledWith(person);
    });

    it("oddaje błąd zapisu konta zamiast go zgubić", async () => {
        const CONFLICT = "Konto systemowe: SystemEmail 'anna@envi.com.pl' is already used by another person account.";
        saveV2.mockResolvedValue({ account: null, profile: {}, errors: [CONFLICT] });

        const { errors } = await saveNewUserAccountData(NEW_USER as any);

        expect(errors).toEqual([CONFLICT]);
    });

    it("padnięte przypisania projektów też raportuje, a nie rzuca dalej", async () => {
        saveAssignments.mockRejectedValue(new Error("Brak dostępu do projektu AQM"));

        const { errors } = await saveNewUserAccountData({
            id: NEW_PERSON_ID,
            systemRoleId: CONTRACT_WORKER,
            _projectAssignments: [{ ourId: "AQM" }],
        } as any);

        expect(errors).toEqual(["Przypisania projektów: Brak dostępu do projektu AQM"]);
    });

    it("bez numeru osoby nie próbuje niczego zapisywać", async () => {
        const { errors } = await saveNewUserAccountData({ systemRoleId: "3" } as any);

        expect(errors).toEqual([]);
        expect(saveV2).not.toHaveBeenCalled();
    });
});

describe("makeUserAddNewHandler - wiersz w liście po dodaniu", () => {
    it("dokłada do listy wiersz ODCZYTANY z serwera, nie złożony z formularza", async () => {
        // Zapis konta z rolą 1/2/3/6/7 zakłada po drodze wiersz uprawnień z domyślnymi
        // flagami roli. Wiersz z formularza pokazywałby same zera i kłamał o stanie bazy.
        const onAddNew = vi.fn();

        await makeUserAddNewHandler(onAddNew)(NEW_USER as any);

        expect(staffMembersRepository.items).toEqual([ROW_FROM_SERVER]);
        expect(onAddNew).toHaveBeenCalledWith(ROW_FROM_SERVER);
    });

    it("czyta wiersz w zakresie „wszystkie osoby”", async () => {
        // Nowa osoba bez e-maila systemowego nie mieści się w domyślnym zakresie listy,
        // a i tak ma się pokazać po dodaniu.
        await makeUserAddNewHandler(vi.fn())(NEW_USER as any);

        const [, requestOptions] = fetchRow.mock.calls[0];
        expect(JSON.parse(requestOptions.body)).toEqual({
            orConditions: [{ personId: NEW_PERSON_ID, scope: "all" }],
        });
    });

    it("odczyt wiersza idzie PO zapisie konta i przypisań", async () => {
        const calls: string[] = [];
        saveV2.mockImplementation(async () => {
            calls.push("account");
            return { account: {}, profile: {}, errors: [] };
        });
        saveAssignments.mockImplementation(async () => {
            calls.push("assignments");
        });
        fetchRow.mockImplementation(async () => {
            calls.push("row");
            return [ROW_FROM_SERVER];
        });

        await makeUserAddNewHandler(vi.fn())(NEW_USER as any);

        expect(calls).toEqual(["account", "assignments", "row"]);
    });

    it("błąd konta zatrzymuje modal, ale wiersz i tak trafia do listy", async () => {
        // Osoba JEST już w bazie - lista musi ją pokazać, a modal ma zostać otwarty
        // z informacją, czego nie zapisał (np. 409 na zajętym e-mailu systemowym).
        saveV2.mockResolvedValue({ account: null, profile: {}, errors: ["Konto systemowe: zajęty e-mail"] });
        const onAddNew = vi.fn();

        await expect(makeUserAddNewHandler(onAddNew)(NEW_USER as any)).rejects.toThrow(/zajęty e-mail/);

        expect(onAddNew).toHaveBeenCalled();
        expect(staffMembersRepository.items).toEqual([ROW_FROM_SERVER]);
    });

    it("ponowne „Zatwierdź” po błędzie nie dubluje wiersza", async () => {
        saveV2.mockResolvedValue({ account: null, profile: {}, errors: ["Konto systemowe: zajęty e-mail"] });
        const handle = makeUserAddNewHandler(vi.fn());

        await expect(handle(NEW_USER as any)).rejects.toThrow();
        saveV2.mockResolvedValue({ account: {}, profile: {}, errors: [] });
        await handle(NEW_USER as any);

        expect(staffMembersRepository.items).toHaveLength(1);
    });

    it("nieudany odczyt wiersza nie przykrywa błędu zapisu konta", async () => {
        // Odczyt jest częścią pokazania wyniku, nie zapisem. Gdyby rzucał, użytkownik
        // dostałby komunikat o liście zamiast o tym, że konto się nie zapisało.
        saveV2.mockResolvedValue({ account: null, profile: {}, errors: ["Konto systemowe: zajęty e-mail"] });
        fetchRow.mockRejectedValue(new Error("Serwer nie odpowiada"));

        await expect(makeUserAddNewHandler(vi.fn())(NEW_USER as any)).rejects.toThrow(/zajęty e-mail/);
    });

    it("nieudany odczyt wiersza sam z siebie nie wywraca zapisu", async () => {
        fetchRow.mockRejectedValue(new Error("Serwer nie odpowiada"));
        const onAddNew = vi.fn();

        await expect(makeUserAddNewHandler(onAddNew)(NEW_USER as any)).resolves.toBeUndefined();

        expect(onAddNew).toHaveBeenCalled();
        expect(staffMembersRepository.items).toEqual([]);
    });
});
