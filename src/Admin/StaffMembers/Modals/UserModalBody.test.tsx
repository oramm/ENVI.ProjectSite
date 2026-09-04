/**
 * Checkbox „Użytkownik FIDmana" w modalu dodawania użytkownika (okno „Personel i uprawnienia").
 *
 * Przeniesione w PER-5 z testu skasowanego ekranu „Dodawanie użytkowników" (GLO-P1).
 * Renderujemy z prawdziwym react-hook-form, bo pytanie brzmi nie „czy komponent istnieje",
 * tylko „czy zaznaczenie trafia do wartości formularza" - checkbox bez `register` wygląda
 * identycznie i nic nie zapisuje.
 */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { UserModalBody } from "./UserModalBody";

vi.mock("../../../React/MainSetupReact", () => ({
    default: { isProjectScopedRoleId: () => false },
}));
vi.mock("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({
    EntitySelector: () => null,
    ProjectSelector: () => null,
    SystemRoleSelector: () => null,
}));

let form: UseFormReturn<FieldValues>;

function Harness({ initialData }: { initialData: any }) {
    form = useForm({ defaultValues: {} });
    return (
        <FormProvider value={form}>
            <UserModalBody initialData={initialData} {...({} as any)} />
        </FormProvider>
    );
}

const CHECKBOX_LABEL = "Użytkownik FIDmana (loguje się tym samym kontem Google)";

describe("UserModalBody - checkbox użytkownika FIDmana przy zakładaniu", () => {
    it("renderuje się z opisem po polsku i domyślnie jest odznaczony", async () => {
        render(<Harness initialData={{}} />);

        const checkbox = (await screen.findByLabelText(CHECKBOX_LABEL)) as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        expect(form.getValues("fidmanEnabled")).toBe(false);
    });

    it("zaznaczenie trafia do wartości formularza, czyli do payloadu zapisu", async () => {
        render(<Harness initialData={{}} />);
        const checkbox = (await screen.findByLabelText(CHECKBOX_LABEL)) as HTMLInputElement;

        await act(async () => {
            checkbox.click();
        });

        expect(checkbox.checked).toBe(true);
        expect(form.getValues("fidmanEnabled")).toBe(true);
    });

    it("startuje bez pola przypisań - brak pola znaczy „nie ruszaj”, pusta lista „wyczyść”", async () => {
        render(<Harness initialData={{}} />);
        await screen.findByLabelText(CHECKBOX_LABEL);

        expect(form.getValues("_projectAssignments")).toBeUndefined();
    });
});
