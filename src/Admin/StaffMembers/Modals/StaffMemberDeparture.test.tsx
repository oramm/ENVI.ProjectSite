import React, { useEffect } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StaffMemberData } from "../../../../Typings/bussinesTypes";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { StaffMemberEditModalButton, shouldConfirmStaffMemberDeparture } from "./StaffMemberModalButtons";

const mocks = vi.hoisted(() => ({
    editItem: vi.fn(),
    saveAccount: vi.fn(),
    saveAssignments: vi.fn(),
}));

vi.mock("../StaffMembersController", () => ({
    staffMembersRepository: {
        name: "StaffMembers",
        currentItems: [{ id: 7, personId: 7, isActive: true }],
        editItem: mocks.editItem,
        replaceItemById: vi.fn(),
        replaceCurrentItemById: vi.fn(),
        saveToSessionStorage: vi.fn(),
    },
}));
vi.mock("../../../Persons/personsV2Helpers", async (importOriginal) => ({
    ...await importOriginal<typeof import("../../../Persons/personsV2Helpers")>(),
    savePersonV2AccountAndProfile: mocks.saveAccount,
    saveProjectAssignments: mocks.saveAssignments,
}));
vi.mock("./UserModalButtons", () => ({ fetchStaffMemberRow: vi.fn(async () => null) }));
vi.mock("./StaffMemberValidationSchema", () => ({ makeStaffMemberValidationSchema: undefined }));
vi.mock("../../../React/Tools/ToolsFetch", () => ({ default: { sendClientErrorReport: vi.fn() } }));
// Prawdziwy formularz i cały zapis; pomijamy odczyty paneli niezwiązanych z potwierdzeniem.
vi.mock("./StaffMemberModalBody", () => ({
    StaffMemberModalBody: function Body({ initialData }: ModalBodyProps<StaffMemberData>) {
        const { register, reset } = useFormContext();
        useEffect(() => reset({ isActive: initialData?.isActive, isDriver: false }), [initialData, reset]);
        return <>
            <label><input type="checkbox" {...register("isActive")} />Aktywny</label>
            <label><input type="checkbox" {...register("isDriver")} />Kierowca</label>
        </>;
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
    mocks.editItem.mockImplementation(async (data) => ({ id: 7, personId: 7, isDriver: data.isDriver }));
    mocks.saveAccount.mockResolvedValue({ account: { isActive: false }, errors: [] });
    mocks.saveAssignments.mockResolvedValue(undefined);
});

function openModal(isActive = true) {
    const onClose = vi.fn();
    render(<StaffMemberEditModalButton show onClose={onClose} modalProps={{
        initialData: { id: 7, personId: 7, _personName: "Anna", _personSurname: "Kowalska", isActive } as StaffMemberData,
        onEdit: vi.fn(),
    }} />);
    return onClose;
}

async function submit() {
    const button = screen.getByRole("button", { name: "Zatwierdź" });
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(button);
}

function expectNoSave() {
    expect(mocks.editItem).not.toHaveBeenCalled();
    expect(mocks.saveAccount).not.toHaveBeenCalled();
    expect(mocks.saveAssignments).not.toHaveBeenCalled();
}

describe("potwierdzenie odejścia osoby", () => {
    it.each([
        [true, false, true],
        [true, true, false],
        [false, true, false],
        [false, false, false],
        [undefined, false, false],
        [true, undefined, false],
    ])("stan %s → %s: potwierdzenie %s", (initial, active, expected) => {
        expect(shouldConfirmStaffMemberDeparture(initial, active)).toBe(expected);
    });

    it("Wróć nie zapisuje i zachowuje formularz w otwartym oknie osoby", async () => {
        const onClose = openModal();
        fireEvent.click(screen.getByLabelText("Aktywny"));
        fireEvent.click(screen.getByLabelText("Kierowca"));
        await submit();
        await screen.findByText("Anna Kowalska odchodzi z firmy?");
        expectNoSave();
        fireEvent.click(screen.getByRole("button", { name: "Wróć" }));
        await waitFor(() => expect(screen.queryByText("Anna Kowalska odchodzi z firmy?")).toBeNull());
        expectNoSave();
        expect(onClose).not.toHaveBeenCalled();
        expect((screen.getByLabelText("Aktywny") as HTMLInputElement).checked).toBe(false);
        expect((screen.getByLabelText("Kierowca") as HTMLInputElement).checked).toBe(true);
        // Powtórny zapis ponownie wymaga potwierdzenia.
        await submit();
        await screen.findByRole("button", { name: "Wyłącz konto i zapisz" });
        expectNoSave();
    });

    it("Wyłącz konto i zapisz dopiero teraz zapisuje flagi, konto i przypisania", async () => {
        const onClose = openModal();
        fireEvent.click(screen.getByLabelText("Aktywny"));
        await submit();
        const confirm = await screen.findByRole("button", { name: "Wyłącz konto i zapisz" });
        expectNoSave();
        expect(confirm.classList.contains("btn-danger")).toBe(true);
        expect(screen.getByRole("alert").classList.contains("alert-warning")).toBe(true);
        fireEvent.click(confirm);
        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
        expect(mocks.editItem).toHaveBeenCalledTimes(1);
        expect(mocks.saveAccount).toHaveBeenCalledWith(7, expect.objectContaining({ isActive: false }), {}, "StaffMembers");
        expect(mocks.saveAssignments).toHaveBeenCalledTimes(1);
    });

    it.each([[true, false], [false, false], [false, true]])(
        "zapis bez potwierdzenia: początkowo %s, przełącz %s",
        async (initial, toggle) => {
            const onClose = openModal(initial);
            if (toggle) fireEvent.click(screen.getByLabelText("Aktywny"));
            await submit();
            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
            expect(mocks.saveAccount).toHaveBeenCalledWith(7, expect.objectContaining({ isActive: toggle ? !initial : initial }), {}, "StaffMembers");
            expect(screen.queryByText("Anna Kowalska odchodzi z firmy?")).toBeNull();
        },
    );
});
