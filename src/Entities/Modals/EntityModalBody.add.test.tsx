/**
 * GUS-4b / D-GUS-6 — nowy podmiot zakłada się z rejestru, nie z klawiatury.
 *
 * Test pilnuje obu połówek decyzji właściciela naraz, bo osobno każda jest szkodliwa:
 *  - nazwa, adres, REGON i KRS są przy DODAWANIU zablokowane do wpisywania, żeby
 *    rozbieżności nie powstawały na wejściu,
 *  - wyjście awaryjne „Dodaj mimo braku w rejestrze" odblokowuje wpisywanie ręczne,
 *    bo 94 podmioty w słowniku nie mają NIP-u, a jeden jest czeski — twarda blokada
 *    zatrzymałaby prawdziwą pracę.
 *
 * Trzecia rzecz: przy EDYCJI nic nie jest blokowane, a przy różnicy w oknie pojawia
 * się porównanie z rejestrem.
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

function Harness({ isEditing, initialData }: { isEditing: boolean; initialData?: any }) {
    form = useForm({ defaultValues: {} });
    return (
        <FormProvider value={form}>
            <EntityModalBody isEditing={isEditing} initialData={initialData} {...({} as any)} />
        </FormProvider>
    );
}

function field(label: string): HTMLInputElement {
    return screen.getByLabelText(label) as HTMLInputElement;
}

describe("EntityModalBody - zakładanie podmiotu z rejestru (D-GUS-6)", () => {
    beforeEach(() => {
        hoisted.lookupNip.mockReset();
    });

    it("przy dodawaniu NIP jest do wpisania, a pola z rejestru są zablokowane", () => {
        render(<Harness isEditing={false} />);

        expect(field("NIP").disabled).toBe(false);
        expect(field("Nazwa").disabled).toBe(true);
        expect(field("Adres").disabled).toBe(true);
        expect(field("REGON").disabled).toBe(true);
        expect(field("KRS").disabled).toBe(true);
        // Nazwa skrócona to pole własne PS - rejestr jej nie zna, więc nigdy nie jest blokowana.
        expect(field("Skrócona nazwa").disabled).toBe(false);
    });

    it("wyjście awaryjne odblokowuje wpisywanie ręczne", () => {
        render(<Harness isEditing={false} />);

        fireEvent.click(screen.getByRole("button", { name: /Dodaj mimo braku w rejestrze/ }));

        expect(field("Nazwa").disabled).toBe(false);
        expect(field("Adres").disabled).toBe(false);
        expect(screen.getByText(/nie sprawdzano/)).toBeInTheDocument();
    });

    it("udane pobranie z GUS też odblokowuje pola - dane wolno poprawić przed zapisem", async () => {
        hoisted.lookupNip.mockResolvedValue({
            name: "T-MOBILE POLSKA SPÓŁKA AKCYJNA",
            address: "ul. Marynarska 12, 02-674 Warszawa",
            regon: "011417295",
            krs: "0000391193",
        });

        render(<Harness isEditing={false} />);
        fireEvent.change(field("NIP"), { target: { value: "5261040567" } });
        fireEvent.click(screen.getByRole("button", { name: /Pobierz z GUS/ }));

        await waitFor(() => expect(field("Nazwa").disabled).toBe(false));
        expect(field("Nazwa").value).toBe("T-MOBILE POLSKA SPÓŁKA AKCYJNA");
        expect(screen.queryByRole("button", { name: /Dodaj mimo braku w rejestrze/ })).not.toBeInTheDocument();
    });

    it("przy edycji nic nie jest blokowane", () => {
        render(<Harness isEditing initialData={{ id: 7, name: "Gmina Kobierzyce" }} />);

        expect(field("Nazwa").disabled).toBe(false);
        expect(screen.queryByRole("button", { name: /Dodaj mimo braku w rejestrze/ })).not.toBeInTheDocument();
    });

    it("porównanie z rejestrem pokazuje się przy różnicy, a przy zgodności nie", () => {
        const { unmount } = render(
            <Harness
                isEditing
                initialData={{
                    id: 38,
                    name: "INIKO Grupa MGGP",
                    gusStatus: "DIFF",
                    gusSnapshot: { name: "HTS Spółka z ograniczoną odpowiedzialnością" },
                }}
            />
        );
        expect(screen.getByText("Porównanie z rejestrem GUS")).toBeInTheDocument();
        unmount();

        render(<Harness isEditing initialData={{ id: 90, name: "Gmina Kobierzyce", gusStatus: "OK" }} />);
        expect(screen.queryByText("Porównanie z rejestrem GUS")).not.toBeInTheDocument();
    });
});
