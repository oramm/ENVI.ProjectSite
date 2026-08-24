/**
 * TypesTreeGraph - kafle w HTML nad warstwą SVG.
 *
 * Testujemy to, co zmiana techniki rysowania mogłaby po cichu zepsuć:
 * kafel ma stać dokładnie tam, gdzie kazał układ, długa nazwa ma zostać
 * w całości w DOM (ucina CSS, nie kod), a znaczenia niesione obwódką
 * i listwą koloru mają przetrwać przeprowadzkę z SVG.
 *
 * Układ podajemy wprost, bez `layout()` - to test renderera, nie układu.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TypesTreeGraph } from "./TypesTreeGraph";
import { EMPTY_SUMMARY, Layout, LayoutNode, LayoutTask } from "./typesTreeLayout";

const DLUGA_NAZWA = "Uzgodnienia branżowe i decyzje administracyjne etapu drugiego";

const node = (over: Partial<LayoutNode> = {}): LayoutNode => {
    const y = over.y ?? 20;
    return {
        id: "caseType:45",
        kind: "caseType",
        entityId: 45,
        label: "Inicjacja umowy",
        x: 660,
        y,
        w: 260,
        h: 42,
        // Punkt zaczepienia linii: środek nagłówka, nie środek kafla.
        anchorY: y + 21,
        ...over,
    };
};

const task = (over: Partial<LayoutTask> = {}): LayoutTask => ({
    id: 1,
    name: "Sprawdzić i zatwierdzić polisę",
    status: "Nie rozpoczęty",
    ...over,
});

const layoutOf = (nodes: LayoutNode[], edges: Layout["edges"] = []): Layout => ({
    nodes,
    edges,
    width: 1260,
    height: 1394,
    // Podsumowanie liczy układ; renderer tylko je przekazuje dalej, więc tu puste.
    summary: EMPTY_SUMMARY,
});

function tile(nodeId: string) {
    const found = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!found) throw new Error(`Brak kafla ${nodeId}`);
    return found as HTMLElement;
}

describe("TypesTreeGraph", () => {
    it("stawia kafel w miejscu i rozmiarze z układu", () => {
        render(<TypesTreeGraph layout={layoutOf([node()])} />);
        const style = tile("caseType:45").style;
        expect(style.position).toBe("absolute");
        expect(style.left).toBe("660px");
        expect(style.top).toBe("20px");
        expect(style.width).toBe("260px");
        expect(style.height).toBe("42px");
        expect(style.boxSizing).toBe("border-box");
    });

    it("płótno ma wymiary z układu, a warstwa SVG leży pod kaflami", () => {
        const { container } = render(<TypesTreeGraph layout={layoutOf([node()])} />);
        const canvas = screen.getByTestId("types-tree-canvas");
        expect(canvas.style.width).toBe("1260px");
        expect(canvas.style.height).toBe("1394px");
        const svg = container.querySelector("svg")!;
        expect(svg.getAttribute("width")).toBe("1260");
        expect(svg.getAttribute("height")).toBe("1394");
        // Kafle są rodzeństwem SVG i stoją po nim w DOM, więc rysują się na wierzchu.
        expect(canvas.firstElementChild).toBe(svg);
    });

    it("nie ucina długiej nazwy w kodzie - pełna zostaje w DOM i w podpowiedzi", () => {
        render(<TypesTreeGraph layout={layoutOf([node({ label: DLUGA_NAZWA, description: "Opis typu" })])} />);
        expect(screen.getByText(DLUGA_NAZWA)).toBeInTheDocument();
        expect(screen.getByText(DLUGA_NAZWA).style.textOverflow).toBe("ellipsis");
        expect(tile("caseType:45").title).toBe(`${DLUGA_NAZWA}\n\nOpis typu`);
    });

    it("przerywana obwódka zostaje przy typie wyłącznie podsprawowym", () => {
        render(
            <TypesTreeGraph
                layout={layoutOf([
                    node({ id: "subCaseType:9", kind: "subCaseType", entityId: 9, isSubCaseOnly: true }),
                    node(),
                ])}
            />,
        );
        expect(tile("subCaseType:9").style.border).toContain("dashed");
        expect(tile("caseType:45").style.border).toContain("solid");
    });

    it("zaznaczenie pogrubia obwódkę i zmienia jej kolor", () => {
        render(<TypesTreeGraph layout={layoutOf([node()])} selectedNodeId="caseType:45" />);
        // jsdom normalizuje kolor do rgb() - porównujemy po normalizacji, nie po zapisie
        expect(tile("caseType:45").style.border).toBe("3px solid rgb(13, 110, 253)");
    });

    it("numer folderu stoi przed nazwą we własnym slocie", () => {
        render(<TypesTreeGraph layout={layoutOf([node({ badge: "03" })])} />);
        const badge = screen.getByText("03");
        expect(badge.style.flex).toBe("0 0 34px");
        expect(badge.compareDocumentPosition(screen.getByText("Inicjacja umowy"))).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
    });

    it("krawędzie dalej rysuje SVG, po jednej ścieżce na krawędź", () => {
        const parent = node({ id: "milestoneType:2", kind: "milestoneType", entityId: 2, x: 330, y: 20, w: 230 });
        const { container } = render(
            <TypesTreeGraph
                layout={layoutOf([parent, node()], [{ fromId: "milestoneType:2", toId: "caseType:45", label: "01" }])}
            />,
        );
        expect(container.querySelectorAll("svg path")).toHaveLength(1);
        expect(container.querySelector("svg text")?.textContent).toBe("01");
    });

    it("klik oddaje węzeł z układu", () => {
        const onNodeClick = vi.fn();
        render(<TypesTreeGraph layout={layoutOf([node()])} onNodeClick={onNodeClick} />);
        tile("caseType:45").click();
        expect(onNodeClick).toHaveBeenCalledWith(expect.objectContaining({ id: "caseType:45" }));
    });

    it("zadania rysują się w kaflu jako osobne wiersze, poniżej nazwy", () => {
        render(
            <TypesTreeGraph
                layout={layoutOf([
                    node({
                        h: 42 + 4 + 2 * 20,
                        tasks: [task(), task({ id: 2, name: "Pilotowanie przedłużenia", status: "Backlog" })],
                        taskCount: 2,
                    }),
                ])}
            />,
        );
        const rows = screen.getAllByTestId("types-tree-task");
        expect(rows).toHaveLength(2);
        expect(screen.getByText("Sprawdzić i zatwierdzić polisę")).toBeInTheDocument();
        // Lista stoi POD nagłówkiem z nazwą sprawy, nie obok niej.
        const header = screen.getByTestId("types-tree-node-header");
        expect(header.compareDocumentPosition(screen.getByTestId("types-tree-task-list"))).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
        expect(screen.queryByTestId("types-tree-task-count")).toBeNull();
    });

    it("zadanie w Backlogu niesie skrót statusu, zwykłe nie", () => {
        render(
            <TypesTreeGraph
                layout={layoutOf([
                    node({
                        h: 42 + 4 + 2 * 20,
                        tasks: [task(), task({ id: 2, name: "wysłanie maila", status: "Backlog" })],
                        taskCount: 2,
                    }),
                ])}
            />,
        );
        expect(screen.getAllByText("Backlog")).toHaveLength(1);
    });

    it("schowane zadania zostawiają licznik na kaflu, a nie pustkę", () => {
        render(<TypesTreeGraph layout={layoutOf([node({ taskCount: 3 })])} />);
        expect(screen.queryByTestId("types-tree-task-list")).toBeNull();
        const chip = screen.getByTestId("types-tree-task-count");
        expect(chip.textContent).toBe("3 zad.");
        expect(chip.title).toContain("Zadania startowe: 3");
    });

    it("kafel bez zadań nie dostaje ani listy, ani licznika", () => {
        render(<TypesTreeGraph layout={layoutOf([node({ taskCount: 0 })])} />);
        expect(screen.queryByTestId("types-tree-task-list")).toBeNull();
        expect(screen.queryByTestId("types-tree-task-count")).toBeNull();
    });

    it("linia zaczepia się o środek nagłówka, nie o środek wysokiego kafla", () => {
        const parent = node({
            id: "milestoneType:2",
            kind: "milestoneType",
            entityId: 2,
            x: 330,
            y: 20,
            w: 230,
        });
        const tall = node({ y: 20, h: 42 + 4 + 3 * 20, taskCount: 3 });
        const { container } = render(
            <TypesTreeGraph layout={layoutOf([parent, tall], [{ fromId: "milestoneType:2", toId: "caseType:45" }])} />,
        );
        const d = container.querySelector("svg path")!.getAttribute("d")!;
        // anchorY obu węzłów = 41; gdyby liczyć środek kafla, koniec byłby na 73.
        expect(d).toBe("M 560 41 C 610 41, 610 41, 660 41");
    });

    it("kafel z dziećmi dostaje chevron, a bez dzieci nie dostaje", () => {
        render(
            <TypesTreeGraph
                layout={layoutOf([
                    node({ canCollapse: true, isExpanded: true }),
                    node({ id: "subCaseType:9", kind: "subCaseType", entityId: 9, x: 1010, y: 120 }),
                ])}
                onToggleCollapse={() => undefined}
            />,
        );
        expect(tile("caseType:45").querySelector('[data-testid="types-tree-chevron"]')).not.toBeNull();
        expect(tile("subCaseType:9").querySelector('[data-testid="types-tree-chevron"]')).toBeNull();
    });

    it("klik w chevron zwija gałąź i NIE zaznacza kafla", () => {
        const onNodeClick = vi.fn();
        const onToggleCollapse = vi.fn();
        render(
            <TypesTreeGraph
                layout={layoutOf([node({ canCollapse: true, isExpanded: true })])}
                onNodeClick={onNodeClick}
                onToggleCollapse={onToggleCollapse}
            />,
        );
        fireEvent.click(screen.getByTestId("types-tree-chevron"));
        expect(onToggleCollapse).toHaveBeenCalledTimes(1);
        // Gdyby klik doszedł do kafla, drugi klik otwierałby edycję - a użytkownik
        // chciał tylko zwinąć gałąź.
        expect(onNodeClick).not.toHaveBeenCalled();
    });

    it("kafel chowający dzieci pokazuje licznik i tłumaczy go w podpowiedzi", () => {
        render(
            <TypesTreeGraph
                layout={layoutOf([
                    node({
                        canCollapse: true,
                        isExpanded: false,
                        hiddenCount: 8,
                        hiddenLabel: "Ukryte: 8 typów podspraw",
                    }),
                ])}
                onToggleCollapse={() => undefined}
            />,
        );
        expect(screen.getByTestId("types-tree-hidden-count").textContent).toBe("+8");
        expect(tile("caseType:45").getAttribute("title")).toContain("Ukryte: 8 typów podspraw");
    });

    it("pusty układ zostaje komunikatem, nie pustym płótnem", () => {
        // Od kolumny zerowej pusty układ znaczy już tylko „nie wybrano typu umowy":
        // typ bez kamieni ma własny kafel i tłumaczy się sam.
        render(<TypesTreeGraph layout={{ nodes: [], edges: [], width: 0, height: 0, summary: EMPTY_SUMMARY }} />);
        expect(screen.getByText(/Nie wybrano typu umowy/)).toBeInTheDocument();
        expect(screen.queryByTestId("types-tree-canvas")).toBeNull();
    });
});

/**
 * Kolumna zerowa: typy umów w drzewie (A4) i typy wycofane (E2).
 *
 * Renderer ma tu trzy nowe obowiązki i każdy z nich da się zgubić po cichu:
 * przekreślić nazwę wycofanego typu, przygasić typ, którego gałęzi nie widać,
 * i nie udawać, że kafel pustej gałęzi jest klikalny.
 */
const contractNode = (over: Partial<LayoutNode> = {}): LayoutNode => {
    const y = over.y ?? 20;
    return {
        id: "contractType:14",
        kind: "contractType",
        entityId: 14,
        label: "Czerwony ryczałtowy",
        x: 0,
        y,
        w: 230,
        h: 42,
        anchorY: y + 21,
        isDimmed: false,
        ...over,
    };
};

/** Nazwa kafla siedzi w nagłówku, w jedynym elemencie z tekstem etykiety. */
function labelSpan(nodeId: string, label: string) {
    const found = Array.from(tile(nodeId).querySelectorAll("span")).find(
        (element) => element.textContent === label,
    );
    if (!found) throw new Error(`Brak etykiety ${label} w kaflu ${nodeId}`);
    return found as HTMLElement;
}

describe("TypesTreeGraph - kolumna typów umów", () => {
    it("wycofany typ ma nazwę przekreśloną, a pełne słowo w podpowiedzi", () => {
        render(<TypesTreeGraph layout={layoutOf([contractNode({ isRetired: true })])} />);
        expect(labelSpan("contractType:14", "Czerwony ryczałtowy").style.textDecoration).toBe("line-through");
        // E2 zrezygnowało z plakietki, więc podpowiedź jest jedynym miejscem,
        // które mówi, DLACZEGO nazwa jest przekreślona.
        expect(tile("contractType:14").getAttribute("title")).toContain("Ten typ umowy jest wycofany.");
        expect(tile("contractType:14").getAttribute("data-retired")).toBe("true");
    });

    it("typ aktywny nie jest przekreślony", () => {
        render(<TypesTreeGraph layout={layoutOf([contractNode({ label: "Żółty", isRetired: false })])} />);
        expect(labelSpan("contractType:14", "Żółty").style.textDecoration).toBe("");
        expect(tile("contractType:14").getAttribute("data-retired")).toBeNull();
    });

    it("typ, którego gałęzi nie widać, jest przygaszony; wybrany - nie", () => {
        render(
            <TypesTreeGraph
                layout={layoutOf([
                    contractNode({ id: "contractType:1", entityId: 1, label: "AGL", isDimmed: true }),
                    contractNode({ y: 72 }),
                ])}
            />,
        );
        expect(tile("contractType:1").style.opacity).toBe("0.55");
        expect(tile("contractType:1").getAttribute("data-dimmed")).toBe("true");
        expect(tile("contractType:14").style.opacity).toBe("1");
    });

    it("wybrany typ umowy jest wyróżniony tak samo jak zaznaczony węzeł", () => {
        render(<TypesTreeGraph layout={layoutOf([contractNode()])} />);
        // Wybrany typ decyduje o tym, którą gałąź widać - to JEST zaznaczenie
        // tego widoku, więc nie dostaje osobnego, konkurencyjnego sygnału.
        expect(tile("contractType:14").style.border).toContain("3px");
        expect(tile("contractType:14").style.border).toContain("rgb(13, 110, 253)");
    });

    it("licznik kamieni na nierozwiniętym typie to ten sam mechanizm, co przy zwiniętej gałęzi", () => {
        render(
            <TypesTreeGraph
                layout={layoutOf([
                    contractNode({ isDimmed: true, hiddenCount: 5, hiddenLabel: "Ukryte: 5 typów kamieni" }),
                ])}
            />,
        );
        expect(screen.getByTestId("types-tree-hidden-count").textContent).toBe("+5");
        expect(tile("contractType:14").getAttribute("title")).toContain("Ukryte: 5 typów kamieni");
    });

    it("kafel pustej gałęzi tłumaczy się sam i nie udaje klikalnego", () => {
        const onNodeClick = vi.fn();
        render(
            <TypesTreeGraph
                layout={layoutOf([
                    {
                        id: "emptyBranch:14",
                        kind: "emptyBranch",
                        entityId: 14,
                        label: "brak przypisanych kamieni",
                        x: 330,
                        y: 20,
                        w: 230,
                        h: 42,
                        anchorY: 41,
                    },
                ])}
                onNodeClick={onNodeClick}
            />,
        );
        const kafel = tile("emptyBranch:14");
        expect(kafel.textContent).toContain("brak przypisanych kamieni");
        // Przerywana obwódka - to samo, co przy „wyłącznie jako podsprawa",
        // ale w innej kolumnie, więc znaczenia nie kolidują.
        expect(kafel.style.border).toContain("dashed");
        expect(kafel.style.cursor).toBe("default");
        fireEvent.click(kafel);
        expect(onNodeClick).not.toHaveBeenCalled();
    });

    it("klik w typ umowy dochodzi do widoku - to on przełącza gałąź", () => {
        const onNodeClick = vi.fn();
        render(<TypesTreeGraph layout={layoutOf([contractNode({ isDimmed: true })])} onNodeClick={onNodeClick} />);
        fireEvent.click(tile("contractType:14"));
        expect(onNodeClick).toHaveBeenCalledTimes(1);
        expect(onNodeClick.mock.calls[0][0].entityId).toBe(14);
    });
});
