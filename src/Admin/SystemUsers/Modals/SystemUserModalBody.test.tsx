/**
 * GLO-P1 — checkbox „Użytkownik FIDmana" w formularzu konta.
 *
 * Renderujemy z prawdziwym react-hook-form, bo pytanie brzmi nie „czy komponent istnieje",
 * tylko „czy zaznaczenie trafia do wartości formularza" — a to jest właśnie miejsce, w którym
 * pole potrafi się urwać (checkbox bez `register` wygląda identycznie i nic nie zapisuje).
 */
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { SystemUserModalBody } from "./SystemUserModalBody";

const hoisted = vi.hoisted(() => ({
    fetchPersonAccountV2: vi.fn(),
    fetchPersonProfileV2: vi.fn(),
    fetchPersonProjectAssignments: vi.fn(),
}));

vi.mock("../../../Persons/personsV2Helpers", () => ({
    fetchPersonAccountV2: hoisted.fetchPersonAccountV2,
    fetchPersonProfileV2: hoisted.fetchPersonProfileV2,
    fetchPersonProjectAssignments: hoisted.fetchPersonProjectAssignments,
}));
vi.mock("../../../React/MainSetupReact", () => ({
    default: { isProjectScopedRoleId: () => false },
}));
vi.mock("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({
    EntitySelector: () => null,
    ProjectSelector: () => null,
    SystemRoleSelector: () => null,
}));

let form: UseFormReturn<FieldValues>;

function Harness({ initialData, isEditing }: { initialData: any; isEditing: boolean }) {
    form = useForm({ defaultValues: {} });
    return (
        <FormProvider value={form}>
            <SystemUserModalBody initialData={initialData} isEditing={isEditing} {...({} as any)} />
        </FormProvider>
    );
}

const CHECKBOX_LABEL = "Użytkownik FIDmana (loguje się tym samym kontem Google)";

describe("SystemUserModalBody — checkbox użytkownika FIDmana", () => {
    beforeEach(() => {
        hoisted.fetchPersonAccountV2.mockReset().mockResolvedValue(null);
        hoisted.fetchPersonProfileV2.mockReset().mockResolvedValue(null);
        hoisted.fetchPersonProjectAssignments.mockReset().mockResolvedValue([]);
    });

    it("renderuje się z opisem po polsku i domyślnie jest odznaczony", async () => {
        render(<Harness initialData={{}} isEditing={false} />);

        const checkbox = await screen.findByLabelText(CHECKBOX_LABEL);
        expect(checkbox).toBeTruthy();
        expect((checkbox as HTMLInputElement).checked).toBe(false);
        expect(form.getValues("fidmanEnabled")).toBe(false);
    });

    it("zaznaczenie trafia do wartości formularza, czyli do payloadu zapisu", async () => {
        render(<Harness initialData={{}} isEditing={false} />);
        const checkbox = (await screen.findByLabelText(CHECKBOX_LABEL)) as HTMLInputElement;

        await act(async () => {
            checkbox.click();
        });

        expect(checkbox.checked).toBe(true);
        expect(form.getValues("fidmanEnabled")).toBe(true);
    });

    it("przy edycji stan bierze się z konta v2, nie z danych osoby", async () => {
        // Flaga mieszka w PersonAccounts, a formularz dostaje ją osobnym żądaniem — gdyby
        // czytał ją tylko z initialData, każde otwarcie modala pokazywałoby odznaczone pole.
        hoisted.fetchPersonAccountV2.mockResolvedValue({
            personId: 42,
            systemEmail: "anna@envi.com.pl",
            fidmanEnabled: true,
        });

        render(<Harness initialData={{ id: 42 }} isEditing={true} />);

        await waitFor(() => {
            expect(form.getValues("fidmanEnabled")).toBe(true);
        });
        const checkbox = (await screen.findByLabelText(CHECKBOX_LABEL)) as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
    });

    it("konto bez flagi zostaje odznaczone, zamiast dziedziczyć wartość z poprzedniego renderu", async () => {
        hoisted.fetchPersonAccountV2.mockResolvedValue({
            personId: 43,
            systemEmail: "jan@envi.com.pl",
        });

        render(<Harness initialData={{ id: 43 }} isEditing={true} />);

        await waitFor(() => {
            expect(hoisted.fetchPersonAccountV2).toHaveBeenCalled();
        });
        expect(form.getValues("fidmanEnabled")).toBe(false);
    });
});
