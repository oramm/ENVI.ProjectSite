/**
 * GUS-4b — okno „w PS" / „w rejestrze GUS" i składanie listy pól do przyjęcia.
 *
 * Pilnowana jest tu zasada nadrzędna całego packa (D-GUS-1): GUS proponuje, człowiek
 * przyjmuje. Na serwer ma pojechać DOKŁADNIE to, co człowiek zaznaczył — ani pole
 * więcej. Drugi obowiązek testu: po przyjęciu wartość z rejestru musi wejść do
 * formularza, bo inaczej „Zatwierdź" w modalu odesłałby starą nazwę i po cichu
 * cofnęłoby przyjęcie.
 *
 * Harness formularza przepisany z ./EntityModalBody.gus.test.tsx.
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { FormProvider } from "../../View/Modals/FormContext";
import { EntityGusPanel, initialSelection } from "./EntityGusPanel";

const hoisted = vi.hoisted(() => ({ checkEntityInGus: vi.fn(), acceptGusFields: vi.fn() }));

vi.mock("../gusEntityService", async () => {
    const actual = await vi.importActual<typeof import("../gusEntityService")>("../gusEntityService");
    return {
        ...actual,
        checkEntityInGus: hoisted.checkEntityInGus,
        acceptGusFields: hoisted.acceptGusFields,
    };
});

const SNAPSHOT = {
    name: "HTS Spółka z ograniczoną odpowiedzialnością",
    address: "ul. Ciepłownicza 8A, 35-322 Rzeszów",
    regon: "121212553",
    krs: "0000449322",
};

const PS_VALUES = {
    name: "INIKO Grupa MGGP",
    address: "ul. Zagłoby 8/2B, 35-303 Rzeszów",
    regon: "",
    krs: "",
};

let form: UseFormReturn<FieldValues>;

function Harness({ defaults = PS_VALUES, snapshot = SNAPSHOT }: { defaults?: any; snapshot?: any }) {
    form = useForm({ defaultValues: defaults });
    return (
        <FormProvider value={form}>
            <EntityGusPanel
                entityId={38}
                initialStatus="DIFF"
                initialCheckedAt={null}
                initialSnapshot={snapshot}
                entityValues={defaults}
            />
        </FormProvider>
    );
}

function tick(label: string): HTMLInputElement {
    return screen.getByLabelText(`Przyjmij z GUS: ${label}`) as HTMLInputElement;
}

describe("EntityGusPanel", () => {
    beforeEach(() => {
        hoisted.checkEntityInGus.mockReset();
        hoisted.acceptGusFields.mockReset();
    });

    describe("initialSelection", () => {
        it("zaznacza tylko pola, w których obie strony mają wartość i te wartości się rozjeżdżają", () => {
            // REGON i KRS zostają odznaczone, bo PS ich nie ma - to brak danych, nie sprzeczność.
            expect(initialSelection(PS_VALUES, SNAPSHOT)).toEqual(["name", "address"]);
        });

        it("pole zgodne z rejestrem nie jest zaznaczone - nie ma czego przyjmować", () => {
            expect(initialSelection({ ...PS_VALUES, name: SNAPSHOT.name }, SNAPSHOT)).toEqual(["address"]);
        });

        it("pola, którego rejestr nie podał, nie da się zaznaczyć", () => {
            expect(initialSelection({ ...PS_VALUES, krs: "0000000001" }, { ...SNAPSHOT, krs: "" })).toEqual([
                "name",
                "address",
            ]);
        });

        it("bez migawki nie ma zaznaczonego nic", () => {
            expect(initialSelection(PS_VALUES, null)).toEqual([]);
        });
    });

    it("na serwer idzie dokładnie to, co zaznaczone - odznaczona nazwa nie jedzie", async () => {
        hoisted.acceptGusFields.mockResolvedValue({
            ok: true,
            id: 38,
            applied: ["address"],
            status: "DIFF",
            differences: [],
        });

        render(<Harness />);
        // Startowo zaznaczone są nazwa i adres; człowiek odznacza nazwę, a REGON dokłada ręcznie
        // - i dokładnie taka para ma pojechać na serwer.
        fireEvent.click(tick("Nazwa"));
        fireEvent.click(screen.getByRole("button", { name: /Przyjmij zaznaczone/ }));

        await waitFor(() => expect(hoisted.acceptGusFields).toHaveBeenCalledTimes(1));
        expect(hoisted.acceptGusFields).toHaveBeenCalledWith(38, ["address"]);
    });

    it("bez zaznaczenia nic się nie dzieje - przycisk przyjęcia jest nieczynny", async () => {
        render(<Harness />);
        fireEvent.click(tick("Nazwa"));
        fireEvent.click(tick("Adres"));

        const accept = screen.getByRole("button", { name: /Przyjmij zaznaczone/ }) as HTMLButtonElement;
        expect(accept.disabled).toBe(true);
        fireEvent.click(accept);
        expect(hoisted.acceptGusFields).not.toHaveBeenCalled();
    });

    it("przyjęte pole wchodzi do formularza, nieprzyjęte zostaje nietknięte", async () => {
        hoisted.acceptGusFields.mockResolvedValue({
            ok: true,
            id: 38,
            applied: ["address"],
            status: "DIFF",
            differences: [],
        });

        render(<Harness />);
        fireEvent.click(tick("Nazwa"));
        fireEvent.click(screen.getByRole("button", { name: /Przyjmij zaznaczone/ }));

        await waitFor(() => expect(form.getValues("address")).toBe(SNAPSHOT.address));
        expect(form.getValues("name")).toBe(PS_VALUES.name);
    });

    it("ręczne zaznaczenie pustego pola pozwala je przyjąć - decyduje człowiek, nie automat", async () => {
        hoisted.acceptGusFields.mockResolvedValue({
            ok: true,
            id: 38,
            applied: ["name", "address", "regon"],
            status: "OK",
            differences: [],
        });

        render(<Harness />);
        expect(tick("REGON").checked).toBe(false);
        fireEvent.click(tick("REGON"));
        fireEvent.click(screen.getByRole("button", { name: /Przyjmij zaznaczone/ }));

        await waitFor(() => expect(hoisted.acceptGusFields).toHaveBeenCalledTimes(1));
        expect(hoisted.acceptGusFields).toHaveBeenCalledWith(38, ["name", "address", "regon"]);
    });

    it("„Sprawdź teraz w GUS” odświeża werdykt i migawkę, nie tykając danych podmiotu", async () => {
        hoisted.checkEntityInGus.mockResolvedValue({
            ok: true,
            id: 38,
            status: "OK",
            checkedAt: "2026-09-09T05:31:00.000Z",
            snapshot: { ...SNAPSHOT, name: PS_VALUES.name, address: PS_VALUES.address },
            differences: [],
        });

        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: /Sprawdź teraz w GUS/ }));

        await waitFor(() => expect(screen.getByText(/GUS: zgodny/)).toBeInTheDocument());
        expect(form.getValues("name")).toBe(PS_VALUES.name);
        expect(form.getValues("address")).toBe(PS_VALUES.address);
        // Nazwa i adres zgadzają się już z rejestrem, więc nie ma czego przyjmować.
        expect(tick("Nazwa").checked).toBe(false);
        expect(tick("Adres").checked).toBe(false);
    });

    it("pole, którego rejestr nie podał, ma nieczynny znacznik", () => {
        render(<Harness snapshot={{ ...SNAPSHOT, krs: "" }} />);
        expect(tick("KRS").disabled).toBe(true);
        expect(tick("Nazwa").disabled).toBe(false);
    });
});
