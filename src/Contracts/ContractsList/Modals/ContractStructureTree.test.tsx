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

const hoisted = vi.hoisted(() => ({ fetchContractTemplatesTree: vi.fn(), fetchContractSharedCandidates: vi.fn() }));

vi.mock("./contractTemplatesTreeService", () => ({
    fetchContractTemplatesTree: hoisted.fetchContractTemplatesTree,
}));
vi.mock("./contractSharedCandidatesService", () => ({
    fetchContractSharedCandidates: hoisted.fetchContractSharedCandidates,
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

function Harness({ contractType, project }: { contractType?: object; project?: object }) {
    // Jawny FieldValues: bez niego useForm zawęża typ do { _type } i formularz
    // przestaje pasować do FormProvider, co wywraca build webpackiem.
    form = useForm<FieldValues>({ defaultValues: { _type: contractType, _project: project } });
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

    const candidate = (over: any = {}) => ({ milestoneId: 4889, milestoneName: "Przetarg",
        sourceContractId: 1974, sourceContractName: "Źródłowa umowa", sourceContractAlias: "PT",
        sourceContractOurId: "PT/1", expectedRevision: "a".repeat(64), ...over });

    async function renderTender(shared: any[] = [candidate()], checked = true, tenderCases: any[] = []) {
        hoisted.fetchContractTemplatesTree.mockResolvedValue(tree({ milestoneTypes: [milestoneNode(),
            milestoneNode({ milestoneTypeId: 5, typeName: "Przetarg – obsługa", caseTypes: tenderCases, isCheckedByDefault: checked })] }));
        hoisted.fetchContractSharedCandidates.mockReset().mockResolvedValue(shared);
        render(<Harness contractType={{ id: 2 }} project={{ ourId: "OWN" }} />);
        await waitFor(() => expect(milestoneBox(5)).toBeTruthy());
        await waitFor(() => expect(hoisted.fetchContractSharedCandidates).toHaveBeenCalledWith("OWN", 2));
    }

    async function openPicker() {
        await act(async () => fireEvent.click(screen.getByRole("button", { name: "Wybierz wspólny…" })));
        return screen.findByRole("dialog", { name: "Wybierz wspólny kamień" });
    }

    async function chooseShared(id = 4889) {
        await openPicker();
        await act(async () => fireEvent.click(document.getElementById("shared-tender-" + id)!));
        await act(async () => fireEvent.click(screen.getByRole("button", { name: "Użyj wybranego kamienia" })));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    }

    it("Przetarg ma standardowy checkbox: zaznaczenie tworzy własny, odznaczenie pomija kamień", async () => {
        await renderTender([], false);
        expect(milestoneBox(5)).not.toBeChecked();
        expect(screen.queryByRole("combobox")).toBeNull();
        expect(screen.queryByRole("button", { name: "Wybierz wspólny…" })).toBeNull();
        await act(async () => fireEvent.click(milestoneBox(5)));
        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] }, { milestoneTypeId: 5, caseTypeIds: [] }]);
        expect(screen.getByRole("button", { name: "Wybierz wspólny…" })).toBeEnabled();
        await act(async () => fireEvent.click(milestoneBox(5)));
        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] }]);
    });

    it("wybiera wspólny bez duplikowania spraw i przywraca własny wybór spraw", async () => {
        await renderTender([candidate()], true, [caseNode({ caseTypeId: 55 }), caseNode({ caseTypeId: 56 })]);
        await act(async () => fireEvent.click(screen.getAllByRole("button", { name: "Rozwiń" })[1]));
        await act(async () => fireEvent.click(caseBox(56)));
        await chooseShared();
        expect(milestoneBox(5)).toBeChecked();
        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] },
            { mode: "shared", milestoneTypeId: 5, milestoneId: 4889, expectedRevision: "a".repeat(64) }]);
        expect(form.getValues("_creationRequestId")).toMatch(/^[0-9a-f-]{36}$/);
        expect(screen.getByTestId("shared-tender-result")).toHaveTextContent("PT/1 · PT · Źródłowa umowa");
        expect(caseBox(55)).toBeNull();
        await act(async () => fireEvent.click(screen.getByRole("button", { name: "Utwórz własny zamiast wspólnego" })));
        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] }, { milestoneTypeId: 5, caseTypeIds: [55] }]);
        expect(form.getValues("_creationRequestId")).toBeUndefined();
        expect(caseBox(55)).toBeChecked();
        expect(caseBox(56)).not.toBeChecked();
    });

    it("anulowanie wyboru i zmiany nie modyfikuje formularza ani requestId", async () => {
        await renderTender([candidate(), candidate({ milestoneId: 4890, sourceContractOurId: "PT/2" })]);
        await openPicker();
        fireEvent.click(document.getElementById("shared-tender-4889")!);
        expect(selection()[1]).toEqual({ milestoneTypeId: 5, caseTypeIds: [] });
        expect(form.getValues("_creationRequestId")).toBeUndefined();
        fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        await chooseShared();
        const requestId = form.getValues("_creationRequestId");
        fireEvent.click(screen.getByRole("button", { name: "Zmień" }));
        await screen.findByRole("dialog");
        fireEvent.click(document.getElementById("shared-tender-4890")!);
        fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(selection()[1].milestoneId).toBe(4889);
        expect(form.getValues("_creationRequestId")).toBe(requestId);
    });

    it("odznaczenie wspólnego czyści żądanie, ponowne zaznaczenie wybiera własny", async () => {
        await renderTender();
        await chooseShared();
        fireEvent.click(milestoneBox(5));
        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] }]);
        expect(form.getValues("_creationRequestId")).toBeUndefined();
        expect(screen.queryByTestId("shared-tender-result")).toBeNull();
        fireEvent.click(milestoneBox(5));
        expect(selection()[1]).toEqual({ milestoneTypeId: 5, caseTypeIds: [] });
    });

    it("okno odróżnia podobne kamienie oznaczeniem i pełną nazwą kontraktu oraz ID kamienia", async () => {
        await renderTender([candidate(), candidate({ milestoneId: 4890, sourceContractId: 1975,
            sourceContractOurId: "PT/2", sourceContractName: "Druga umowa" })]);
        await openPicker();
        expect(screen.getByRole("radio", { name: /PT\/1.*Źródłowa umowa.*#4889/ })).toBeVisible();
        expect(screen.getByRole("radio", { name: /PT\/2.*Druga umowa.*#4890/ })).toBeVisible();
        expect(screen.getByRole("button", { name: "Użyj wybranego kamienia" })).toBeDisabled();
    });

    it("Zmień wybiera inny wspólny kamień i nowy requestId", async () => {
        await renderTender([candidate(), candidate({ milestoneId: 4890, sourceContractOurId: "PT/2" })]);
        await chooseShared();
        const previous = form.getValues("_creationRequestId");
        fireEvent.click(screen.getByRole("button", { name: "Zmień" }));
        await screen.findByRole("dialog");
        expect(document.getElementById("shared-tender-4889")).toBeChecked();
        fireEvent.click(document.getElementById("shared-tender-4890")!);
        fireEvent.click(screen.getByRole("button", { name: "Użyj wybranego kamienia" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(selection()[1].milestoneId).toBe(4890);
        expect(form.getValues("_creationRequestId")).not.toBe(previous);
    });

    it("zmiana projektu usuwa wspólny wybór, zamyka okno i usuwa starych kandydatów", async () => {
        await renderTender();
        await chooseShared();
        hoisted.fetchContractSharedCandidates.mockResolvedValue([]);
        fireEvent.click(screen.getByRole("button", { name: "Zmień" }));
        await screen.findByRole("dialog");
        await act(async () => form.setValue("_project", { ourId: "OTHER" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] }]);
        expect(form.getValues("_creationRequestId")).toBeUndefined();
        fireEvent.click(milestoneBox(5));
        await openPicker();
        expect(screen.getByText(/Brak dostępnego wspólnego kamienia/)).toBeVisible();
        expect(screen.queryByRole("radio")).toBeNull();
    });

    it("odświeżenie unieważnia poprzedni wybór i wymaga potwierdzenia świeżej rewizji", async () => {
        await renderTender();
        await chooseShared();
        hoisted.fetchContractSharedCandidates.mockResolvedValue([candidate({ expectedRevision: "b".repeat(64) })]);
        fireEvent.click(screen.getByRole("button", { name: "Zmień" }));
        await screen.findByRole("dialog");
        fireEvent.click(screen.getByRole("button", { name: "Odśwież wspólne kamienie" }));
        await waitFor(() => expect(selection()).toEqual([{ milestoneTypeId: 1, caseTypeIds: [45] }]));
        expect(form.getValues("_creationRequestId")).toBeUndefined();
        expect(screen.getByRole("button", { name: "Użyj wybranego kamienia" })).toBeDisabled();
        await waitFor(() => expect(screen.getByRole("radio")).toBeEnabled());
        fireEvent.click(screen.getByRole("radio"));
        fireEvent.click(screen.getByRole("button", { name: "Użyj wybranego kamienia" }));
        await waitFor(() => expect(selection()[1]?.expectedRevision).toBe("b".repeat(64)));
        expect(form.getValues("_creationRequestId")).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("pusta lista nie zmienia własnego kamienia i pozwala anulować", async () => {
        await renderTender([]);
        await openPicker();
        expect(screen.getByText(/Brak dostępnego wspólnego kamienia/)).toBeVisible();
        expect(screen.getByRole("button", { name: "Użyj wybranego kamienia" })).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
        expect(selection()[1]).toEqual({ milestoneTypeId: 5, caseTypeIds: [] });
    });

    it("błąd listy ma ponowienie w oknie i nie usuwa własnego wyboru", async () => {
        await renderTender();
        hoisted.fetchContractSharedCandidates.mockRejectedValue(new Error("offline"));
        await openPicker();
        fireEvent.click(screen.getByRole("button", { name: "Odśwież wspólne kamienie" }));
        await screen.findByText(/Nie udało się wczytać wspólnych kamieni: offline/);
        expect(selection()[1]).toEqual({ milestoneTypeId: 5, caseTypeIds: [] });
        expect(screen.getByRole("button", { name: "Użyj wybranego kamienia" })).toBeDisabled();
        hoisted.fetchContractSharedCandidates.mockResolvedValue([candidate()]);
        fireEvent.click(screen.getByRole("button", { name: "Odśwież wspólne kamienie" }));
        expect(await screen.findByRole("radio")).toBeVisible();
    });

    it("ignoruje spóźnioną odpowiedź po usunięciu projektu i zamyka wybór", async () => {
        await renderTender();
        let finish!: (items: any[]) => void;
        hoisted.fetchContractSharedCandidates.mockReturnValue(new Promise<any[]>(resolve => { finish = resolve; }));
        await openPicker();
        fireEvent.click(screen.getByRole("button", { name: "Odśwież wspólne kamienie" }));
        await screen.findByText(/Szukam wspólnych kamieni/);
        await act(async () => form.setValue("_project", undefined));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        await act(async () => finish([candidate()]));
        expect(screen.getByRole("button", { name: "Wybierz wspólny…" })).toBeDisabled();
        expect(selection()[1]).toEqual({ milestoneTypeId: 5, caseTypeIds: [] });
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
