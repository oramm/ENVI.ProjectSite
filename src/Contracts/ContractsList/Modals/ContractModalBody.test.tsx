/**
 * ContractModalBody — pole „Objęta synchronizacją" (WYK-2, zadania 1 i 2).
 *
 * Przed tą zmianą formularz umowy nie znał znacznika bramkującego wysyłkę do FIDmana,
 * więc żadna umowa nie mogła zostać włączona bez zapisu w bazie. Testy sprawdzają dwie
 * rzeczy, których nie widać w schemacie walidacji: że kratka jest w formularzu niezależnie
 * od typu umowy oraz że jej stan wraca z danych umowy przy ponownym otwarciu formularza.
 *
 * Używa prawdziwego react-hook-form za FormProvider repo — podstawiony setValue nie
 * dowiódłby niczego o tym, co naprawdę pojedzie w zapisie.
 */
import React from "react";
import { render, waitFor, act, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { ContractModalBody } from "./ContractModalBody";

vi.mock("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({
    ContractRangeSelector: () => null,
    ProjectSelector: () => null,
}));
vi.mock("../../../View/Modals/CommonFormComponents/GenericComponents", () => ({
    ErrorMessage: () => null,
    ValueInPLNInput: () => null,
}));
vi.mock("../../../View/Modals/CommonFormComponents/StatusSelectors", () => ({
    ContractStatusSelector: () => null,
}));
vi.mock("./ContractModalBodiesPartial", () => ({
    OptionalContractDateFields: () => null,
}));
vi.mock("../../../View/Modals/InlineCreateDrawers", () => ({
    ContractRangeInlineCreateDrawer: () => null,
}));
vi.mock("../ContractsController", () => ({
    contractRangesRepository: {},
    projectsRepository: {},
}));

const CHECKBOX_LABEL = "Objęta synchronizacją";

/** Typ „Żółty" (id 3) jest w allowliście syncu; „IK" (id 1) nie jest. */
const SYNCED_TYPE = { id: 3, name: "Żółty" };
const NOT_SYNCED_TYPE = { id: 1, name: "IK" };

let form: UseFormReturn<FieldValues>;

function Harness({ initialData }: { initialData: any }) {
    form = useForm({ defaultValues: {} });
    return (
        <FormProvider value={form}>
            <ContractModalBody initialData={initialData} isEditing={true} {...({} as any)} />
        </FormProvider>
    );
}

const contract = (over: any = {}) => ({
    id: 4242,
    name: "Budowa oczyszczalni",
    number: "ZP/7/2026",
    alias: "OCZ",
    _type: SYNCED_TYPE,
    ...over,
});

function renderForm(initialData: any) {
    const utils = render(<Harness initialData={initialData} />);
    const checkbox = utils.container.querySelector<HTMLInputElement>("#fidmanSyncEnabled");
    return { ...utils, checkbox };
}

describe("ContractModalBody — pole „Objęta synchronizacją”", () => {
    it("renderuje kratkę o etykiecie „Objęta synchronizacją” także dla typu umowy spoza allowlisty syncu", async () => {
        // Świadomie typ, którego sync dziś nie wysyła: allowlista typów żyje w zmiennej
        // środowiskowej serwera, więc formularz nie ma prawa jej zgadywać i chować pola.
        const { checkbox, getByLabelText } = renderForm(
            contract({ _type: NOT_SYNCED_TYPE, fidmanSyncEnabled: false }),
        );

        expect(checkbox).not.toBeNull();
        expect(checkbox!.type).toBe("checkbox");
        expect(getByLabelText(CHECKBOX_LABEL)).toBe(checkbox);
    });

    it("umowa objęta synchronizacją otwiera formularz z kratką zaznaczoną i wartością pola `fidmanSyncEnabled` równą true", async () => {
        const { checkbox } = renderForm(contract({ fidmanSyncEnabled: true }));

        await waitFor(() => expect(form.getValues("fidmanSyncEnabled")).toBe(true));
        expect(checkbox!.checked).toBe(true);
    });

    it("umowa wykluczona otwiera formularz z kratką odznaczoną i wartością pola `fidmanSyncEnabled` równą false", async () => {
        const { checkbox } = renderForm(contract({ fidmanSyncEnabled: false }));

        await waitFor(() => expect(form.getValues("fidmanSyncEnabled")).toBe(false));
        expect(checkbox!.checked).toBe(false);
    });

    it("umowa bez znacznika w danych (serwer nie podał pola) otwiera formularz z kratką odznaczoną", async () => {
        const { checkbox } = renderForm(contract());

        await waitFor(() => expect(form.getValues("fidmanSyncEnabled")).toBe(false));
        expect(checkbox!.checked).toBe(false);
    });

    it("kliknięcie kratki zmienia wartość pola `fidmanSyncEnabled`, czyli tego, co formularz wysyła w zapisie umowy", async () => {
        const { checkbox } = renderForm(contract({ fidmanSyncEnabled: false }));
        await waitFor(() => expect(form.getValues("fidmanSyncEnabled")).toBe(false));

        act(() => {
            fireEvent.click(checkbox!);
        });
        await waitFor(() => expect(form.getValues("fidmanSyncEnabled")).toBe(true));

        act(() => {
            fireEvent.click(checkbox!);
        });
        await waitFor(() => expect(form.getValues("fidmanSyncEnabled")).toBe(false));
    });
});
