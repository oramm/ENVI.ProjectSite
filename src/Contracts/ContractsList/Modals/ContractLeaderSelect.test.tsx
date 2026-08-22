/**
 * Lider konsorcjum w oknie umowy zewnętrznej (LDR-3).
 *
 * Trzy rzeczy, których nie widać w kodzie ani na zrzucie ekranu:
 *  - przy jednym wykonawcy kontrolki NIE MA W DRZEWIE, a nie „jest ukryta stylem";
 *  - wyrzucenie firmy z listy wykonawców zdejmuje wskazanie, jeśli dotyczyło tej firmy;
 *  - brak wskazania jedzie do zapisu jako jawny `null`, bo `lodash.merge` w GeneralModal
 *    pomija `undefined` i zdjęcie lidera nigdy nie doszłoby do serwera.
 *
 * Używa prawdziwego react-hook-form za repozytoryjnym FormProvider — atrapa `setValue`
 * nie dowiodłaby niczego o zależnościach efektu.
 */
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { mergeFormDataIntoItem } from "../../../View/Modals/GeneralModal";
import { OtherContractModalBody } from "./OtherContractModalBody";

vi.mock("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({
    ContractTypeSelector: () => null,
    EntitySelector: () => null,
}));
vi.mock("../../../View/Modals/CommonFormComponents/GenericComponents", () => ({
    MyAsyncTypeahead: () => null,
}));
vi.mock("./ContractModalBody", () => ({ ContractModalBody: () => null }));
vi.mock("./ContractStructureTree", () => ({ ContractStructureTree: () => null }));
vi.mock("../ContractsController", () => ({ entitiesRepository: {} }));
vi.mock("../../../View/Modals/InlineCreateDrawers", () => ({
    EntityInlineCreateDrawer: () => null,
}));

const TERLAN = { id: 537, name: "Terlan S.A.", shortName: "Terlan" };
const WUPRINZ = { id: 265, name: "WUPRINŻ S.A.", shortName: "WUPRINZ" };

let form: UseFormReturn<FieldValues>;

function Harness({ initialData }: { initialData: any }) {
    form = useForm({ defaultValues: {} });
    return (
        <FormProvider value={form}>
            <OtherContractModalBody initialData={initialData} isEditing={true} {...({} as any)} />
        </FormProvider>
    );
}

const leaderSelect = () => screen.queryByLabelText("Lider konsorcjum");

describe("Lider konsorcjum — pole w oknie umowy zewnętrznej", () => {
    it("nie istnieje w drzewie DOM przy jednym wykonawcy", async () => {
        render(<Harness initialData={{ _contractors: [TERLAN] }} />);

        await waitFor(() => expect(form.getValues("_contractors")).toHaveLength(1));
        expect(leaderSelect()).toBeNull();
        // Kontrola pozytywna: gdyby zapytanie było ślepe, nie znalazłoby też pola
        // przy dwóch wykonawcach — a znajduje (test niżej).
    });

    it("pojawia się przy dwóch wykonawcach i pokazuje zapisanego lidera", async () => {
        render(
            <Harness initialData={{ _contractors: [WUPRINZ, TERLAN], _leaderEntityId: WUPRINZ.id }} />
        );

        await waitFor(() => expect(leaderSelect()).not.toBeNull());
        expect((leaderSelect() as HTMLSelectElement).value).toBe(String(WUPRINZ.id));
        // Do wyboru wyłącznie już wybrani wykonawcy plus stan „bez lidera".
        const options = Array.from((leaderSelect() as HTMLSelectElement).options).map((o) => o.value);
        expect(options).toEqual(["", String(WUPRINZ.id), String(TERLAN.id)]);
    });

    it("wybór jest nieobowiązkowy — bez lidera pole stoi na stanie pustym, a zapis niesie null", async () => {
        render(<Harness initialData={{ _contractors: [WUPRINZ, TERLAN] }} />);

        await waitFor(() => expect(leaderSelect()).not.toBeNull());
        expect((leaderSelect() as HTMLSelectElement).value).toBe("");
        expect(form.getValues("_leaderEntityId")).toBeNull();
    });

    it("wyrzucenie lidera z listy wykonawców czyści wskazanie", async () => {
        render(
            <Harness initialData={{ _contractors: [WUPRINZ, TERLAN], _leaderEntityId: WUPRINZ.id }} />
        );
        await waitFor(() => expect(form.getValues("_leaderEntityId")).toBe(WUPRINZ.id));

        act(() => form.setValue("_contractors", [TERLAN, { id: 249, name: "INKADRO Sp. z o.o." }]));

        await waitFor(() => expect(form.getValues("_leaderEntityId")).toBeNull());
    });

    it("wyrzucenie INNEJ firmy zostawia wskazanie nietknięte", async () => {
        render(
            <Harness
                initialData={{
                    _contractors: [WUPRINZ, TERLAN, { id: 249, name: "INKADRO Sp. z o.o." }],
                    _leaderEntityId: WUPRINZ.id,
                }}
            />
        );
        await waitFor(() => expect(form.getValues("_leaderEntityId")).toBe(WUPRINZ.id));

        act(() => form.setValue("_contractors", [WUPRINZ, TERLAN]));

        await waitFor(() => expect((leaderSelect() as HTMLSelectElement).options).toHaveLength(3));
        expect(form.getValues("_leaderEntityId")).toBe(WUPRINZ.id);
    });

    it("zmiana wyboru zapisuje LICZBĘ, nie tekst z pola", async () => {
        render(
            <Harness initialData={{ _contractors: [WUPRINZ, TERLAN], _leaderEntityId: WUPRINZ.id }} />
        );
        await waitFor(() => expect(leaderSelect()).not.toBeNull());

        const select = leaderSelect() as HTMLSelectElement;
        act(() => {
            select.value = String(TERLAN.id);
            select.dispatchEvent(new Event("change", { bubbles: true }));
        });

        await waitFor(() => expect(form.getValues("_leaderEntityId")).toBe(TERLAN.id));
        expect(typeof form.getValues("_leaderEntityId")).toBe("number");
    });
});

/**
 * Szew między formularzem a żądaniem zapisu. Backend czyta `_leaderEntityId` z ciała PUT,
 * a ciało powstaje przez `lodash.merge` rekordu z repozytorium z wartościami formularza —
 * i to merge decyduje, czy zdjęcie lidera w ogóle wyjedzie z przeglądarki.
 */
describe("Lider konsorcjum — wartość z formularza w obiekcie wysyłanym na serwer", () => {
    const currentItem = { id: 482, alias: "KS", _leaderEntityId: WUPRINZ.id, _contractors: [WUPRINZ, TERLAN] };

    it("zmiana lidera nadpisuje wartość z repozytorium", () => {
        const sent = mergeFormDataIntoItem(currentItem, { _leaderEntityId: TERLAN.id });
        expect(sent._leaderEntityId).toBe(TERLAN.id);
    });

    it("zdjęcie lidera (null) dociera na serwer, a nie ginie w merge", () => {
        const sent = mergeFormDataIntoItem(currentItem, { _leaderEntityId: null });
        expect(sent._leaderEntityId).toBeNull();
    });

    it("kontrola negatywna: `undefined` NIE zdjęłoby lidera — stąd `null` w formularzu", () => {
        const sent = mergeFormDataIntoItem(currentItem, { _leaderEntityId: undefined });
        expect(sent._leaderEntityId).toBe(WUPRINZ.id);
    });
});
