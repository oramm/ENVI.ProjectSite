/**
 * AddTypeModal - dwie powłoki jednego formularza (decyzja D2 planu HTY).
 *
 * Testujemy dokładnie to, co decyzja obiecuje i co da się po cichu zepsuć:
 * EDYCJA idzie panelem bocznym bez przyciemnienia tła (drzewo obok zostaje
 * widoczne i klikalne), DODAWANIE zostaje oknem modalnym, a wskazanie innego
 * typu PODMIENIA treść panelu zamiast zamykać go i otwierać od nowa.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddTypeModal, EditTarget } from "./AddTypeModal";
import { EMPTY_TREE, TypesTreeCaseType, TypesTreeData } from "./typesTreeModel";

const caseType = (id: number, name: string): TypesTreeCaseType => ({
    id,
    milestoneTypeId: 1,
    name,
    description: "",
    folderNumber: "04.01",
    isDefault: false,
    isUniquePerMilestone: false,
    isInScrumByDefault: false,
    isSubCaseOnly: false,
    _usageCount: 0,
    _isNameLocked: false,
    _templateId: null,
    _templateName: "",
    _templateDescription: "",
    _taskTemplates: [],
});

const data: TypesTreeData = {
    ...EMPTY_TREE,
    contractTypes: [{ id: 3, name: "Żółty", description: "", status: "", isOur: true }],
    milestoneTypes: [
        {
            id: 1,
            name: "Realizacja",
            description: "",
            isUniquePerContract: false,
            isInScrumByDefault: false,
            _usageCount: 0,
            _isNameLocked: false,
            _templateId: null,
            _templateName: "",
            _templateDescription: "",
        },
    ],
    caseTypes: [caseType(45, "Inicjacja umowy"), caseType(46, "Odbiory częściowe")],
};

const props = {
    data,
    contractTypeId: 3,
    isSaving: false,
    error: null,
    onClose: () => undefined,
    onSubmit: () => undefined,
};

function renderPanel(editTarget: EditTarget, over: Partial<typeof props> = {}) {
    return render(<AddTypeModal kind={null} editTarget={editTarget} {...props} {...over} />);
}

const nameField = () => screen.getByDisplayValue(/Inicjacja umowy|Odbiory częściowe/) as HTMLInputElement;

/** Drzewo z drugim typem kamienia i jednym gotowym powiązaniem - do podpinania. */
const attachData: TypesTreeData = {
    ...data,
    milestoneTypes: [
        ...data.milestoneTypes,
        {
            id: 2,
            name: "Odbiory",
            description: "",
            isUniquePerContract: false,
            isInScrumByDefault: false,
            _usageCount: 0,
            _isNameLocked: false,
            _templateId: null,
            _templateName: "",
            _templateDescription: "",
        },
        {
            id: 51,
            name: "Składanie ofert",
            description: "",
            isUniquePerContract: false,
            isInScrumByDefault: false,
            _usageCount: 0,
            _isNameLocked: true,
            _templateId: null,
            _templateName: "",
            _templateDescription: "",
        },
    ],
    contractTypeMilestoneTypes: [
        { milestoneTypeId: 1, contractTypeId: 3, folderNumber: "01", isDefault: true },
    ],
    offerMilestoneTypes: [{ milestoneTypeId: 51, folderNumber: "01" }],
};

describe("AddTypeModal", () => {
    it("edycję pokazuje w panelu bocznym, bez przyciemnienia tła", () => {
        renderPanel({ kind: "caseType", entity: caseType(45, "Inicjacja umowy") });

        expect(screen.getByTestId("types-tree-panel")).toBeTruthy();
        // Brak okna modalnego i brak przyciemnienia: drzewo obok zostaje widoczne
        // i klikalne - to jest cała treść decyzji D2.
        expect(document.querySelector(".modal")).toBeNull();
        expect(document.querySelector(".offcanvas-backdrop")).toBeNull();
        expect(document.querySelector(".modal-backdrop")).toBeNull();
    });

    it("dodawanie zostaje oknem modalnym", () => {
        render(<AddTypeModal kind="caseType" editTarget={null} {...props} />);

        expect(document.querySelector(".modal")).toBeTruthy();
        expect(screen.queryByTestId("types-tree-panel")).toBeNull();
    });

    it("wskazanie innego typu podmienia treść panelu, a nie otwiera go od nowa", () => {
        const { rerender } = renderPanel({ kind: "caseType", entity: caseType(45, "Inicjacja umowy") });
        const panel = screen.getByTestId("types-tree-panel");
        expect(nameField().value).toBe("Inicjacja umowy");

        rerender(
            <AddTypeModal
                kind={null}
                editTarget={{ kind: "caseType", entity: caseType(46, "Odbiory częściowe") }}
                {...props}
            />,
        );

        // Ten sam element w DOM - panel nie został odmontowany i zamontowany na nowo.
        expect(screen.getByTestId("types-tree-panel")).toBe(panel);
        expect(nameField().value).toBe("Odbiory częściowe");
    });

    it("Przycisk Anuluj zamyka panel i niczego nie zapisuje", () => {
        const onClose = vi.fn();
        const onSubmit = vi.fn();
        renderPanel({ kind: "caseType", entity: caseType(45, "Inicjacja umowy") }, { onClose, onSubmit });

        fireEvent.click(screen.getByText("Anuluj"));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("Esc zamyka panel i niczego nie zapisuje", () => {
        const onClose = vi.fn();
        const onSubmit = vi.fn();
        renderPanel({ kind: "caseType", entity: caseType(45, "Inicjacja umowy") }, { onClose, onSubmit });

        fireEvent.keyDown(document, { key: "Escape", keyCode: 27 });

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("podpinanie pomija typy już podpięte i kamienie ofertowe", () => {
        // Typ już podpięty byłby ślepym wyborem: unikalny indeks na parze (typ kamienia,
        // typ umowy) i tak odrzuciłby zapis. Kamień ofertowy należy do gałęzi ofert -
        // serwer odrzuca go osobną bramką, więc lista nie ma czego obiecywać.
        render(<AddTypeModal {...props} kind="attachMilestoneType" editTarget={null} data={attachData} />);

        const options = Array.from((screen.getByRole("combobox") as HTMLSelectElement).options).map(
            (option) => option.text,
        );
        expect(options).toContain("Odbiory");
        expect(options).not.toContain("Realizacja");
        expect(options).not.toContain("Składanie ofert");
    });

    it("podpinanie wysyła samo powiązanie, bez nazwy i opisu", () => {
        // Nazwa i opis należą do typu i są wspólne dla wszystkich typów umów - gdyby
        // poleciały stąd, podpięcie po cichu przemianowałoby typ u wszystkich.
        const onSubmit = vi.fn();
        render(
            <AddTypeModal
                {...props}
                kind="attachMilestoneType"
                editTarget={null}
                data={attachData}
                onSubmit={onSubmit}
            />,
        );

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "09" } });
        fireEvent.click(screen.getByText("Zapisz"));

        expect(onSubmit).toHaveBeenCalledWith("attachMilestoneType", {
            milestoneTypeId: 2,
            contractTypeId: 3,
            folderNumber: "09",
            isDefault: false,
        });
    });

    it("podpinanie bez wybranego typu nic nie wysyła", () => {
        const onSubmit = vi.fn();
        render(
            <AddTypeModal
                {...props}
                kind="attachMilestoneType"
                editTarget={null}
                data={attachData}
                onSubmit={onSubmit}
            />,
        );

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "09" } });
        fireEvent.click(screen.getByText("Zapisz"));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByText("Wybierz typ kamienia.")).toBeInTheDocument();
    });
});
