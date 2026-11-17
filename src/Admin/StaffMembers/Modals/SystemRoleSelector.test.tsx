import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { SystemRoleSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import MainSetup from "../../../React/MainSetupReact";

let form: UseFormReturn<FieldValues>;
function Harness({ roleId }: { roleId?: number }) {
    form = useForm<FieldValues>({ defaultValues: { systemRoleId: roleId ?? "" } });
    return <FormProvider value={form}><SystemRoleSelector /></FormProvider>;
}

describe("SystemRoleSelector", () => {
    it.each(Object.values(MainSetup.SystemRoles))("pokazuje polską nazwę roli $systemName", (role) => {
        render(<Harness roleId={role.id} />);
        expect(screen.getByRole("combobox")).toHaveValue(MainSetup.ROLE_LABELS[role.systemName]);
    });

    it("wyszukuje po polsku i zapisuje numer roli", async () => {
        render(<Harness />);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "Współpracownik" } });
        fireEvent.click(await screen.findByRole("option", { name: /Współpracownik zewnętrzny/ }));
        expect(screen.getByRole("combobox")).toHaveValue("Współpracownik zewnętrzny");
        expect(form.getValues("systemRoleId")).toBe(MainSetup.SystemRoles.ENVI_COOPERATOR.id);
    });
});
