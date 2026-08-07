/**
 * ContractStructureTree — drzewo struktury tworzonej razem z umową.
 *
 * Sedno testów to zachowania, których nie widać w schemacie walidacji:
 * zaznaczenie startowe równe dzisiejszemu wynikowi, pamięć spraw odznaczonych
 * razem z kamieniem oraz zaznaczanie kamienia przez zaznaczenie sprawy.
 *
 * Używa prawdziwego react-hook-form za FormProvider repo — podstawiony setValue
 * nie dowiódłby niczego o faktycznej zawartości pól formularza.
 */
import React from "react";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { ContractStructureTree } from "./ContractStructureTree";

const hoisted = vi.hoisted(() => ({ fetchContractTemplatesTree: vi.fn() }));

vi.mock("./contractTemplatesTreeService", () => ({
    fetchContractTemplatesTree: hoisted.fetchContractTemplatesTree,
}));
vi.mock("../../../React/MainSetupReact", () => ({ default: { serverUrl: "http://x/" } }));
vi.mock("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({
    UniquenessIcon: () => null,
}));

const OUR_TYPE = { id: 1, name: "IK", isOur: true };

const caseNode = (over: any = {}) => ({
    caseTypeId: 45,
    folderNumber: "01",
    typeName: "Inicjacja umowy",
    templateName: "",
    description: "",
    isUniquePerMilestone: true,
    hasTemplate: true,
    isDefault: true,
    isCheckedByDefault: true,
    ...over,
});

const milestoneNode = (over: any = {}) => ({
    milestoneTypeId: 1,
    folderNumber: "00",
    typeName: "Administracja",
    templateName: "",
    description: "",
    isUniquePerContract: true,
    hasTemplate: true,
    isDefault: true,
    isCheckedByDefault: true,
    caseTypes: [caseNode()],
    ...over,
});

const tree = (over: any = {}) => ({
    milestoneTypes: [milestoneNode()],
    optionalFolders: [
        { key: "MEETING_PROTOCOLS", name: "Notatki ze spotkań", isDefault: true, hint: "powstanie sam" },
    ],
    ...over,
});

let form: UseFormReturn<FieldValues>;

function Harness({ contractType }: { contractType?: object }) {
    // Jawny FieldValues: bez niego useForm zawęża typ do { _type } i formularz
    // przestaje pasować do FormProvider, co wywraca build webpackiem.
    form = useForm<FieldValues>({ defaultValues: { _type: contractType } });
    return (
        <FormProvider value={form}>
            <ContractStructureTree />
        </FormProvider>
    );
}

const selection = () => form.getValues("_milestonesSelection") as any[];
const folders = () => form.getValues("_contractFoldersSelection") as string[];

const milestoneBox = (id: number) => document.getElementById(`milestoneType-${id}`) as HTMLInputElement;
const caseBox = (id: number) => document.getElementById(`caseType-${id}`) as HTMLInputElement;
const folderBox = (key: string) => document.getElementById(`folder-${key}`) as HTMLInputElement;

async function renderTree(data: any = tree()) {
    hoisted.fetchContractTemplatesTree.mockResolvedValue(data);
    render(<Harness contractType={OUR_TYPE} />);
    await waitFor(() => expect(screen.getByTestId("structure-tree")).toBeTruthy());
}

// UWAGA: bez hooka beforeEach. Vitest 4.0.18 raportuje fałszywe „unhandled
// rejection" dla w pełni obsłużonego odrzucenia z vi.fn(), gdy w pliku jest
// jakikolwiek hook beforeEach (potwierdzone na przypadku bez Reacta).
// Implementację mocka ustawia każdy test u siebie; jedyna asercja na liczbę
// wywołań jest w pierwszym teście, więc czyszczenie historii nie jest potrzebne.
describe("ContractStructureTree", () => {
    it("bez typu umowy nie odpytuje serwera i pokazuje podpowiedź", async () => {
        render(<Harness contractType={undefined} />);
        expect(screen.getByTestId("structure-tree-no-type")).toBeTruthy();
        expect(hoisted.fetchContractTemplatesTree).not.toHaveBeenCalled();
    });

    it("zaznacza startowo dokładnie to, co powstaje dziś (isCheckedByDefault)", async () => {
        await renderTree(
            tree({
                milestoneTypes: [
                    milestoneNode(),
                    // Realny przypadek SW: IsDefault, ale bez szablonu
                    milestoneNode({
                        milestoneTypeId: 25,
                        typeName: "Ocena formalna",
                        hasTemplate: false,
                        isCheckedByDefault: false,
                        caseTypes: [
                            caseNode({ caseTypeId: 108, hasTemplate: false, isCheckedByDefault: false }),
                        ],
                    }),
                ],
            }),
        );

        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] }]);
        expect(milestoneBox(1).checked).toBe(true);
        expect(milestoneBox(25).checked).toBe(false);
    });

    it("startuje zwinięte — sprawy nie są renderowane", async () => {
        await renderTree();
        expect(caseBox(45)).toBeNull();
    });

    it("rozwija bez zaznaczania — można zajrzeć do środka", async () => {
        await renderTree(
            tree({ milestoneTypes: [milestoneNode({ isCheckedByDefault: false })] }),
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText("Rozwiń"));
        });

        expect(caseBox(45)).toBeTruthy();
        expect(selection()).toEqual([]);
    });

    it("zaznaczenie kamienia rozwija go i zaznacza jego domyślne sprawy", async () => {
        await renderTree(
            tree({
                milestoneTypes: [
                    milestoneNode({
                        isCheckedByDefault: false,
                        caseTypes: [
                            caseNode({ caseTypeId: 45, isCheckedByDefault: true }),
                            caseNode({ caseTypeId: 46, isCheckedByDefault: false }),
                        ],
                    }),
                ],
            }),
        );

        await act(async () => {
            fireEvent.click(milestoneBox(1));
        });

        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] }]);
        expect(caseBox(45).checked).toBe(true);
        expect(caseBox(46).checked).toBe(false);
    });

    it("pamięta okrojony wybór spraw po odznaczeniu i ponownym zaznaczeniu kamienia", async () => {
        await renderTree(
            tree({
                milestoneTypes: [
                    milestoneNode({
                        caseTypes: [
                            caseNode({ caseTypeId: 45 }),
                            caseNode({ caseTypeId: 46 }),
                        ],
                    }),
                ],
            }),
        );

        // start: obie sprawy zaznaczone
        expect(selection()[0].caseTypeIds).toEqual([45, 46]);

        await act(async () => fireEvent.click(screen.getByLabelText("Rozwiń")));
        await act(async () => fireEvent.click(caseBox(46))); // odznacz jedną
        expect(selection()[0].caseTypeIds).toEqual([45]);

        await act(async () => fireEvent.click(milestoneBox(1))); // odznacz kamień
        expect(selection()).toEqual([]);

        await act(async () => fireEvent.click(milestoneBox(1))); // zaznacz ponownie
        // wraca OKROJONY zestaw, nie domyślny
        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] }]);
    });

    it("zaznaczenie sprawy w niezaznaczonym kamieniu zaznacza kamień, ale tylko tę sprawę", async () => {
        await renderTree(
            tree({
                milestoneTypes: [
                    milestoneNode({
                        isCheckedByDefault: false,
                        caseTypes: [
                            caseNode({ caseTypeId: 45, isCheckedByDefault: true }),
                            caseNode({ caseTypeId: 46, isCheckedByDefault: true }),
                        ],
                    }),
                ],
            }),
        );

        await act(async () => fireEvent.click(screen.getByLabelText("Rozwiń")));
        await act(async () => fireEvent.click(caseBox(46)));

        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [46] }]);
        expect(milestoneBox(1).checked).toBe(true);
    });

    it("odznaczenie wszystkich spraw zostawia kamień zaznaczony", async () => {
        await renderTree();

        await act(async () => fireEvent.click(screen.getByLabelText("Rozwiń")));
        await act(async () => fireEvent.click(caseBox(45)));

        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [] }]);
        expect(milestoneBox(1).checked).toBe(true);
    });

    describe("sekcja folderów", () => {
        it("foldery domyślne startują zaznaczone i dają się odznaczyć", async () => {
            await renderTree();

            expect(folders()).toEqual(["MEETING_PROTOCOLS"]);
            expect(folderBox("MEETING_PROTOCOLS").checked).toBe(true);

            await act(async () => fireEvent.click(folderBox("MEETING_PROTOCOLS")));
            expect(folders()).toEqual([]);
        });

        it("pokazuje tylko foldery zwrócone przez serwer", async () => {
            await renderTree();
            expect(folderBox("MATERIAL_CARDS")).toBeNull();
        });

        it("umowa zewnętrzna dostaje oba foldery", async () => {
            await renderTree(
                tree({
                    optionalFolders: [
                        { key: "MEETING_PROTOCOLS", name: "Notatki ze spotkań", isDefault: true, hint: "" },
                        { key: "MATERIAL_CARDS", name: "Wnioski Materiałowe", isDefault: true, hint: "" },
                    ],
                }),
            );
            expect(folders()).toEqual(["MEETING_PROTOCOLS", "MATERIAL_CARDS"]);
        });
    });

    describe("awaria endpointu", () => {
        it("pokazuje alert, a furtka czyści wybór i odblokowuje zapis", async () => {
            hoisted.fetchContractTemplatesTree.mockImplementation(async () => {
                throw new Error("500");
            });
            render(<Harness contractType={OUR_TYPE} />);

            await waitFor(() => expect(screen.getByTestId("structure-tree-error")).toBeTruthy());

            await act(async () => fireEvent.click(screen.getByText("Utwórz domyślną strukturę")));

            expect(form.getValues("_contractStructureTreeUnavailable")).toBe(true);
            expect(form.getValues("_milestonesSelection")).toBeUndefined();
        });
    });
});
