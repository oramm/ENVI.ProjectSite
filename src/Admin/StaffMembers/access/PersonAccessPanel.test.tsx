import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import StaffMembersSearch from "../StaffMembersSearch";
import { StaffMemberEditModalButton } from "../Modals/StaffMemberModalButtons";

const mocks = vi.hoisted(() => ({
    overview: vi.fn(), person: vi.fn(), row: vi.fn(), saveAccount: vi.fn(), saveAssignments: vi.fn(),
    repository: { items: [] as any[], currentItems: [] as any[], replaceItemById: vi.fn(), replaceCurrentItemById: vi.fn(), saveToSessionStorage: vi.fn() },
}));
vi.mock("./accessOverviewApi", async (original) => ({
    ...await original<typeof import("./accessOverviewApi")>(),
    fetchAccessOverview: mocks.overview,
    fetchPersonAccess: mocks.person,
}));
vi.mock("../Modals/UserModalButtons", () => ({ fetchStaffMemberRow: mocks.row, UserAddNewModalButton: () => null }));
vi.mock("../../../View/Resultsets/FilterableTable/FilterableTable", () => ({
    default: ({ initialObjects }: any) => <div data-testid="grant-list">{initialObjects?.map((row: any) => row._systemEmail).join(", ")}</div>,
    TableTitle: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
vi.mock("../StaffMembersController", () => ({ staffMembersRepository: mocks.repository }));
vi.mock("../Modals/StaffMemberModalBody", () => ({ StaffMemberModalBody: () => null }));
vi.mock("../../../Persons/personsV2Helpers", async (original) => ({
    ...await original<typeof import("../../../Persons/personsV2Helpers")>(),
    savePersonV2AccountAndProfile: mocks.saveAccount,
    saveProjectAssignments: mocks.saveAssignments,
}));
// Zastępujemy jedynie wnętrze ogólnego modalu; otwieranie i handler zapisu są prawdziwe.
vi.mock("../../../View/Modals/GeneralModal", () => ({
    GeneralModal: ({ show, title, onEdit, onClose, modalBodyProps }: any) => show ? (
        <div role="dialog" aria-label={title}>
            <span>{modalBodyProps.initialData._systemEmail}</span>
            <button onClick={async () => { await onEdit({ ...modalBodyProps.initialData }, { ...modalBodyProps.initialData, systemRoleId: 3 }); onClose(); }}>Zapisz</button>
            <button onClick={onClose}>Anuluj</button>
        </div>
    ) : null,
}));

const person = {
    personId: 617, name: "Anna", surname: "Kowalska", entityName: "ENVI", systemRoleId: 3,
    role: "ENVI_EMPLOYEE", assignments: [], contractRoles: [], letterContracts: [],
    areas: [{ area: "projects", sees: true, value: "wszystkie", source: "rola", why: "rola" }],
};
const row = { id: 617, personId: 617, _systemRoleId: 3, _systemEmail: "anna@envi.pl", isActive: true };

beforeEach(() => {
    vi.clearAllMocks();
    mocks.overview.mockResolvedValue([person]);
    mocks.person.mockResolvedValue(person);
    mocks.row.mockReset().mockResolvedValue(row);
    mocks.saveAccount.mockResolvedValue({ account: { systemRoleId: 3 }, errors: [] });
    mocks.saveAssignments.mockResolvedValue(undefined);
    mocks.repository.items = [row];
    mocks.repository.currentItems = [{ id: 999 }];
    mocks.repository.replaceItemById.mockImplementation((id, fresh) => {
        mocks.repository.items = mocks.repository.items.map((item) => item.id === id ? fresh : item);
    });
});

async function openPerson() {
    render(<MemoryRouter><StaffMembersSearch title="Personel i uprawnienia" /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Kto ma do czego dostęp" }));
    fireEvent.click(await screen.findByRole("button", { name: "Anna Kowalska" }));
    return screen.findByRole("button", { name: "Zmień uprawnienia" });
}

describe("edycja uprawnień z przeglądu", () => {
    it("otwiera ten sam modal ze świeżym wierszem, zapisuje i odświeża osobę oraz przegląd", async () => {
        fireEvent.click(await openPerson());
        expect(await screen.findByRole("dialog", { name: "Uprawnienia osoby" })).toHaveTextContent("anna@envi.pl");
        expect(mocks.row).toHaveBeenCalledWith(617);
        expect(mocks.repository.currentItems).toEqual([row]);
        const freshRow = { ...row, _systemEmail: "po-zapisie@envi.pl" };
        mocks.row.mockResolvedValueOnce(freshRow);
        fireEvent.click(screen.getByRole("button", { name: "Zapisz" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(mocks.saveAccount).toHaveBeenCalledWith(617, expect.objectContaining({ systemRoleId: 3 }), {}, "StaffMembers");
        expect(mocks.saveAssignments).toHaveBeenCalled();
        expect(mocks.repository.replaceItemById).toHaveBeenCalledWith(617, freshRow);
        expect(mocks.repository.saveToSessionStorage).toHaveBeenCalled();
        expect(mocks.person).toHaveBeenCalledTimes(2);
        expect(mocks.overview).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId("person-access")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Kto ma do czego dostęp" })).toHaveClass("active");
        expect(screen.queryByTestId("grant-list")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "← Przegląd" }));
        expect(screen.getByTestId("access-overview")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Nadawanie uprawnień" }));
        expect(screen.getByTestId("grant-list")).toHaveTextContent("po-zapisie@envi.pl");
    });

    it("pokazuje ładowanie, pozwala anulować i ponownie otworzyć świeże dane", async () => {
        let resolve!: (value: typeof row) => void;
        mocks.row.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
        fireEvent.click(await openPerson());
        expect(screen.getByRole("button", { name: /Wczytywanie/ })).toBeDisabled();
        resolve(row);
        await screen.findByRole("dialog");
        fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        mocks.row.mockResolvedValueOnce({ ...row, _systemEmail: "nowy@envi.pl" });
        fireEvent.click(screen.getByRole("button", { name: "Zmień uprawnienia" }));
        expect(await screen.findByRole("dialog")).toHaveTextContent("nowy@envi.pl");
        expect(mocks.saveAccount).not.toHaveBeenCalled();
    });

    it.each(["błąd", "brak wiersza"])("pokazuje błąd pobrania (%s) i umożliwia ponowienie", async (failure) => {
        if (failure === "błąd") mocks.row.mockRejectedValueOnce(new Error("sieć"));
        else mocks.row.mockResolvedValueOnce(null);
        fireEvent.click(await openPerson());
        expect(await screen.findByRole("alert")).toHaveTextContent("Nie udało się wczytać osoby");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Zmień uprawnienia" }));
        await screen.findByRole("dialog");
    });

    it("po wyjściu z panelu spóźniony odczyt nie podmienia bieżącej osoby repozytorium", async () => {
        let resolve!: (value: typeof row) => void;
        mocks.row.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
        fireEvent.click(await openPerson());
        fireEvent.click(screen.getByRole("button", { name: "Nadawanie uprawnień" }));
        await act(async () => { resolve(row); });
        expect(mocks.repository.currentItems).toEqual([{ id: 999 }]);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("zachowuje otwieranie ołówkiem bez sterowania z zewnątrz", async () => {
        const { container } = render(<StaffMemberEditModalButton modalProps={{ initialData: row as any, onEdit: vi.fn() }} />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        fireEvent.click(container.querySelector(".icon")!);
        await screen.findByRole("dialog", { name: "Uprawnienia osoby" });
        fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
