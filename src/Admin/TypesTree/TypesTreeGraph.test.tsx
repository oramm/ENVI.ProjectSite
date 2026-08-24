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
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TypesTreeGraph } from "./TypesTreeGraph";
import { Layout, LayoutNode } from "./typesTreeLayout";

const DLUGA_NAZWA = "Uzgodnienia branżowe i decyzje administracyjne etapu drugiego";

const node = (over: Partial<LayoutNode> = {}): LayoutNode => ({
    id: "caseType:45",
    kind: "caseType",
    entityId: 45,
    label: "Inicjacja umowy",
    x: 660,
    y: 20,
    w: 260,
    h: 42,
    ...over,
});

const layoutOf = (nodes: LayoutNode[], edges: Layout["edges"] = []): Layout => ({
    nodes,
    edges,
    width: 1260,
    height: 1394,
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

    it("pusty układ zostaje komunikatem, nie pustym płótnem", () => {
        render(<TypesTreeGraph layout={{ nodes: [], edges: [], width: 0, height: 0 }} />);
        expect(screen.getByText(/nie ma przypisanych typów kamieni milowych/)).toBeInTheDocument();
        expect(screen.queryByTestId("types-tree-canvas")).toBeNull();
    });
});
