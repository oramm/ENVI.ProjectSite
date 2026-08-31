/**
 * InvoiceModalBody — podmioty trzecie przy edycji istniejącej faktury.
 *
 * Zgłoszenie właściciela (2026-08-31): otwarcie do edycji faktury, która MA ustawiony podmiot
 * trzeci, dokładało puste wiersze „Podmiot 3”. Test odtwarza wejście z listy faktur: znacznik
 * „jednostka podległa JST” (albo „członek grupy VAT”) zapisany na fakturze plus jeden podmiot
 * trzeci na liście.
 *
 * Sprawdzamy stan formularza, a nie liczbę pól na ekranie — to on jedzie w zapisie.
 */
import { render, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { InvoiceModalBody } from "./InvoiceModalBody";

vi.mock("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({
    ContractSelector: () => null,
    EntitySelector: () => null,
    PersonSelectorPreloaded: () => null,
}));
vi.mock("../../../View/Modals/CommonFormComponents/GenericComponents", () => ({
    ErrorMessage: () => null,
}));
vi.mock("../../../View/Modals/InlineCreateDrawers", () => ({
    EntityInlineCreateDrawer: () => null,
}));
vi.mock("../InvoicesController", () => ({
    entitiesRepository: {},
}));
// Formularz pyta MainSetup o zalogowanego użytkownika (pole „właściciel”) i o repozytorium osób —
// jedno i drugie żyje dopiero w zalogowanej aplikacji, więc w teście stoi atrapa.
vi.mock("../../../React/MainSetupReact", async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    const MainSetup = actual.default;
    return {
        ...actual,
        default: class extends MainSetup {
            static personsEnviRepository = { items: [] };
            static getCurrentUserAsPerson() {
                return { id: 7, name: "Michał", surname: "Kotala" };
            }
        },
    };
});

let form: UseFormReturn<FieldValues>;

function Harness({ initialData }: { initialData: any }) {
    form = useForm({ defaultValues: {} });
    return (
        <FormProvider value={form}>
            <InvoiceModalBody initialData={initialData} isEditing={true} {...({} as any)} />
        </FormProvider>
    );
}

/** Faktura tak, jak przychodzi z listy faktur: znacznik JST i jeden podmiot trzeci. */
const invoiceWithThirdParty = (over: any = {}) => ({
    id: 175,
    number: "175/2026",
    status: "Wysłana",
    issueDate: "2026-07-03",
    daysToPay: 30,
    description: "Nadzór inwestorski",
    _contract: { id: 4, ourId: "TES.IK.04" },
    _entity: { id: 9, name: "Gmina Kościerzyce", taxNumber: "7471234567", address: "Kościerzyce 201" },
    _owner: { id: 1, name: "Agnieszka", surname: "Brodziak" },
    isJstSubordinate: true,
    isGvMember: false,
    includeThirdParty: true,
    _thirdParties: [{ role: 8, entityId: 11, _entity: { id: 11, name: "ZWiK w Kościerzycach" } }],
    ...over,
});

describe("InvoiceModalBody — podmioty trzecie przy edycji", () => {
    it("nie dokłada pustych wierszy do faktury ze znacznikiem JST", async () => {
        render(<Harness initialData={invoiceWithThirdParty()} />);

        await waitFor(() => expect(form.getValues("_thirdParties")).toBeDefined());
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(form.getValues("_thirdParties")).toHaveLength(1);
        expect(form.getValues("_thirdParties")[0]._entity.name).toBe("ZWiK w Kościerzycach");
    });

    it("nie dokłada pustych wierszy do faktury ze znacznikiem grupy VAT", async () => {
        render(
            <Harness
                initialData={invoiceWithThirdParty({
                    isJstSubordinate: false,
                    isGvMember: true,
                    _thirdParties: [{ role: 10, entityId: 12, _entity: { id: 12, name: "Członek GV" } }],
                })}
            />
        );

        await waitFor(() => expect(form.getValues("_thirdParties")).toBeDefined());
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(form.getValues("_thirdParties")).toHaveLength(1);
    });

    it("faktura z włączonym podmiotem trzecim, ale bez wpisanego podmiotu, dostaje jeden pusty wiersz do wypełnienia", async () => {
        render(<Harness initialData={invoiceWithThirdParty({ isJstSubordinate: false, _thirdParties: [] })} />);

        await waitFor(() => expect(form.getValues("_thirdParties")).toBeDefined());
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(form.getValues("_thirdParties")).toHaveLength(1);
        expect(form.getValues("_thirdParties")[0]._entity).toBeFalsy();
    });
});
