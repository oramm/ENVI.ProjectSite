import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { FormProvider } from "../../View/Modals/FormContext";
import { normalizeStaffMembersScope, StaffMembersFilterBody } from "./StaffMemberFilterBody";

/**
 * Pole „Zakres" okna uprawnień (PER-8, uwaga ownera): przeglądarka pamięta kryteria filtra,
 * więc po zamianie checkboxa na listę rozwijaną w polu lądowało `false` albo pusty string -
 * lista była już „z uprawnieniami", a pole pokazywało pustkę. Pole ma pokazywać zakres,
 * którego serwer faktycznie użyje.
 */
vi.mock("../../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({
    EntitySelector: () => null,
}));

let form: UseFormReturn<FieldValues>;

function Harness({ scope }: { scope: unknown }) {
    form = useForm({ defaultValues: { scope } as FieldValues });
    return (
        <FormProvider value={form}>
            <StaffMembersFilterBody />
        </FormProvider>
    );
}

describe("normalizeStaffMembersScope - to samo rozstrzygnięcie co serwer", () => {
    it.each([undefined, null, "", false, "ALL", "Users", 0])("%p → z uprawnieniami", (value) => {
        expect(normalizeStaffMembersScope(value)).toBe("permissions");
    });

    it("trzy znane zakresy przechodzą bez zmian", () => {
        for (const value of ["permissions", "users", "all"]) expect(normalizeStaffMembersScope(value)).toBe(value);
    });
});

describe("pole Zakres pokazuje faktycznie użyty zakres", () => {
    it("rola ma polską nazwę i nadal zapisuje numer do filtra", () => {
        render(<Harness scope="all" />);
        const option = screen.getByRole("option", { name: "Pracownik ENVI" });
        expect(option).toHaveValue("3");
        fireEvent.change(option.closest("select")!, { target: { value: "3" } });
        expect(form.getValues("systemRoleId")).toBe("3");
        expect(screen.queryByRole("option", { name: "ENVI_EMPLOYEE" })).not.toBeInTheDocument();
    });
    it("wartość dawnego checkboxa z pamięci przeglądarki (false) staje się „Z uprawnieniami”", async () => {
        const { container } = render(<Harness scope={false} />);
        const select = container.querySelector("#staffScope") as HTMLSelectElement;

        await waitFor(() => expect(form.getValues("scope")).toBe("permissions"));
        expect(select.value).toBe("permissions");
    });

    it("pusty string po „Wyczyść” staje się „Z uprawnieniami”", async () => {
        render(<Harness scope="" />);

        await waitFor(() => expect(form.getValues("scope")).toBe("permissions"));
    });

    it("zakres „all” z pomostu zostaje", async () => {
        const { container } = render(<Harness scope="all" />);
        const select = container.querySelector("#staffScope") as HTMLSelectElement;

        await waitFor(() => expect(select.value).toBe("all"));
        expect(form.getValues("scope")).toBe("all");
    });
});
