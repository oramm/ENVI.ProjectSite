/**
 * GUS-1 - przycisk "Pobierz z GUS" wypelnia w formularzu podmiotu takze REGON i KRS.
 *
 * Do lipca serwis zwracał oba pola, a formularz je wyrzucał, bo Entities nie miało na nie
 * kolumn. Po migracji 002 kolumny są, więc test pilnuje, że wartości faktycznie lądują
 * w formularzu — inaczej zapis dalej by je gubił i nikt by tego nie zauważył.
 *
 * Wzorzec harnessu z ../../Admin/StaffMembers/Modals/StaffMemberModalBody.test.tsx.
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { FormProvider } from "../../View/Modals/FormContext";
import { EntityModalBody } from "./EntityModalBody";

const hoisted = vi.hoisted(() => ({ lookupNip: vi.fn() }));

vi.mock("./gusLookupService", () => ({ lookupNip: hoisted.lookupNip }));

let form: UseFormReturn<FieldValues>;

function Harness({ initialData }: { initialData?: any }) {
    form = useForm({ defaultValues: {} });
    return (
        <FormProvider value={form}>
            <EntityModalBody isEditing initialData={initialData} {...({} as any)} />
        </FormProvider>
    );
}

describe("EntityModalBody - przycisk Pobierz z GUS wypełnia REGON i KRS", () => {
    beforeEach(() => {
        hoisted.lookupNip.mockReset();
    });

    it("odpowiedź GUS-u wypełnia nazwę, adres, REGON i KRS", async () => {
        hoisted.lookupNip.mockResolvedValue({
            name: "T-MOBILE POLSKA SPÓŁKA AKCYJNA",
            address: "ul. Marynarska 12, 02-674 Warszawa",
            regon: "011417295",
            krs: "0000391193",
        });

        render(<Harness initialData={{ id: 1, taxNumber: "5261040567" }} />);
        await waitFor(() => expect(form.getValues("taxNumber")).toBe("5261040567"));

        fireEvent.click(screen.getByRole("button", { name: /Pobierz z GUS/i }));

        await waitFor(() => expect(form.getValues("regon")).toBe("011417295"));
        expect(form.getValues("krs")).toBe("0000391193");
        expect(form.getValues("name")).toBe("T-MOBILE POLSKA SPÓŁKA AKCYJNA");
        expect(form.getValues("address")).toBe("ul. Marynarska 12, 02-674 Warszawa");

        // Wartości widać też w polach, więc człowiek może je poprawić przed zapisem.
        expect((screen.getByLabelText("REGON") as HTMLInputElement).value).toBe("011417295");
        expect((screen.getByLabelText("KRS") as HTMLInputElement).value).toBe("0000391193");
    });

    it("brak KRS-u w odpowiedzi czyści pole, zamiast zostawiać numer poprzedniego podmiotu", async () => {
        hoisted.lookupNip.mockResolvedValue({
            name: "JAN KOWALSKI DZIAŁALNOŚĆ GOSPODARCZA",
            address: "ul. Piękna 5, 00-001 Warszawa",
            regon: "123456789",
        });

        render(<Harness initialData={{ id: 2, taxNumber: "5261040567", krs: "0000391193" }} />);
        await waitFor(() => expect(form.getValues("krs")).toBe("0000391193"));

        fireEvent.click(screen.getByRole("button", { name: /Pobierz z GUS/i }));

        await waitFor(() => expect(form.getValues("regon")).toBe("123456789"));
        expect(form.getValues("krs")).toBe("");
    });

    it("REGON i KRS z bazy trafiają do formularza przy otwarciu okna edycji", async () => {
        render(<Harness initialData={{ id: 3, regon: "011417295", krs: "0000391193" }} />);

        await waitFor(() => expect(form.getValues("regon")).toBe("011417295"));
        expect(form.getValues("krs")).toBe("0000391193");
    });
});
