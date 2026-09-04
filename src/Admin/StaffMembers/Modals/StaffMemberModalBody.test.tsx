/**
 * Modal uprawnień: skąd bierze się stan pól konta przy edycji.
 *
 * Przeniesione w PER-5 z testu skasowanego ekranu „Dodawanie użytkowników" (GLO-P1), gdzie
 * flaga FIDmana dojeżdżała osobnym żądaniem. Tu konto przychodzi razem z wierszem listy
 * (`_fidmanEnabled`, `_systemEmail` z odczytu panelu) - gdyby formularz czytał tylko flagi,
 * każde otwarcie okna pokazywałoby FIDmana odznaczonego, a zapis by go gasił.
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { StaffMemberModalBody } from "./StaffMemberModalBody";

const hoisted = vi.hoisted(() => ({
    fetchPersonProjectAssignments: vi.fn(),
}));

vi.mock("../../../Persons/personsV2Helpers", () => ({
    fetchPersonProjectAssignments: hoisted.fetchPersonProjectAssignments,
}));
vi.mock("../../../React/MainSetupReact", () => ({
    default: { isProjectScopedRoleId: () => false },
}));
vi.mock("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({
    ProjectSelector: () => null,
    SystemRoleSelector: () => null,
}));

let form: UseFormReturn<FieldValues>;

function Harness({ initialData }: { initialData: any }) {
    form = useForm({ defaultValues: {} });
    return (
        <FormProvider value={form}>
            <StaffMemberModalBody isEditing initialData={initialData} {...({} as any)} />
        </FormProvider>
    );
}

const CHECKBOX_LABEL = "Użytkownik FIDmana (loguje się tym samym kontem Google)";

describe("StaffMemberModalBody - konto przy edycji bierze się z wiersza listy", () => {
    beforeEach(() => {
        hoisted.fetchPersonProjectAssignments.mockReset().mockResolvedValue([]);
    });

    it("zaznaczony FIDman i e-mail systemowy z wiersza trafiają do formularza", async () => {
        render(
            <Harness initialData={{ personId: 42, _systemEmail: "anna@envi.com.pl", _fidmanEnabled: true }} />
        );

        await waitFor(() => {
            expect(form.getValues("fidmanEnabled")).toBe(true);
        });
        const checkbox = (await screen.findByLabelText(CHECKBOX_LABEL)) as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
        expect(form.getValues("systemEmail")).toBe("anna@envi.com.pl");
    });

    it("wiersz bez flagi daje odznaczone pole, a nie wartość z poprzedniego renderu", async () => {
        render(<Harness initialData={{ personId: 43, _systemEmail: "jan@envi.com.pl" }} />);

        await waitFor(() => {
            expect(hoisted.fetchPersonProjectAssignments).toHaveBeenCalledWith(43);
        });
        expect(form.getValues("fidmanEnabled")).toBe(false);
        const checkbox = (await screen.findByLabelText(CHECKBOX_LABEL)) as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
    });

    it("przypisania projektów dojeżdżają osobnym żądaniem i nie nadpisują pól konta", async () => {
        hoisted.fetchPersonProjectAssignments.mockResolvedValue([{ id: 7 }]);

        render(<Harness initialData={{ personId: 44, _fidmanEnabled: true }} />);

        await waitFor(() => {
            expect(form.getValues("_projectAssignments")).toEqual([{ id: 7 }]);
        });
        expect(form.getValues("fidmanEnabled")).toBe(true);
    });
});
