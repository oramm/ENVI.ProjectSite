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

/**
 * Zdarzenie wskaźnika zbudowane z `MouseEvent`: jsdom nie ma `PointerEvent`,
 * a domyślna ścieżka `fireEvent.pointerDown` gubi wtedy współrzędne i przycisk.
 */
function pointer(type: string, clientX: number, clientY: number) {
    return new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX, clientY });
}

function tile(nodeId: string) {
    const found = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!found) throw new Error(`Brak kafla ${nodeId}`);
    return found as HTMLElement;
}

/**
 * Nadaje kontenerowi płótna wymiary.
 *
 * jsdom nie liczy układu, więc `clientWidth` i `clientHeight` są zerowe, a każdy pomiar
 * „co widać" wychodziłby pusty. Komponent traktuje zero jako „nie ma czego mierzyć",
 * więc bez tej podmiany przycisk dopasowania nigdy by się nie pokazał.
 */
function sizeScroll(scroll: HTMLElement, width: number, height: number) {
    Object.defineProperty(scroll, "clientWidth", { configurable: true, value: width });
    Object.defineProperty(scroll, "clientHeight", { configurable: true, value: height });
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

    it("nie ucina długiej nazwy w kodzie - pełna zostaje w DOM, a podpowiedź niesie sam opis", () => {
        render(<TypesTreeGraph layout={layoutOf([node({ label: DLUGA_NAZWA, description: "Opis typu" })])} />);
        expect(screen.getByText(DLUGA_NAZWA)).toBeInTheDocument();
        expect(screen.getByText(DLUGA_NAZWA).style.textOverflow).toBe("ellipsis");
        // Nazwa stoi na kaflu, więc w podpowiedzi jej nie ma (decyzja ownera 2026-08-24).
        expect(tile("caseType:45").title).toBe("Opis typu");
    });

    it("kafel bez opisu nie ma podpowiedzi w ogóle", () => {
        render(<TypesTreeGraph layout={layoutOf([node()])} />);
        expect(tile("caseType:45").getAttribute("title")).toBeNull();
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
        // Punkty sterujące MIJAJĄ SIĘ (635 przed 585) - to jest ta mocniejsza krzywizna
        // z 2026-08-24: przy punktach w połowie drogi oba stałyby na 610.
        expect(d).toBe("M 560 41 C 635 41, 585 41, 660 41");
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
        // Zdanie siedzi na plakietce, nie na kaflu: kafel powtarzałby to, co widać obok.
        expect(screen.getByTestId("types-tree-hidden-count").title).toBe("Ukryte: 8 typów podspraw");
        expect(tile("caseType:45").getAttribute("title")).toBeNull();
    });

    it("Ctrl+kółko przybliża drzewo, samo kółko nie rusza powiększenia", () => {
        render(<TypesTreeGraph layout={layoutOf([node()])} />);
        const scroll = screen.getByTestId("types-tree-scroll");
        const canvas = screen.getByTestId("types-tree-canvas");
        sizeScroll(scroll, 1300, 600);
        // Bez Ctrl kółko ma dalej przewijać stronę, nie przybliżać.
        fireEvent.wheel(scroll, { deltaY: -100 });
        expect(canvas.style.zoom).toBe("1");
        fireEvent.wheel(scroll, { deltaY: -100, ctrlKey: true });
        expect(Number(canvas.style.zoom)).toBeCloseTo(1.1, 5);
        // Sufit i podłoga: bez nich jedno mocniejsze kręcenie gubi drzewo z ekranu.
        for (let i = 0; i < 40; i += 1) fireEvent.wheel(scroll, { deltaY: -100, ctrlKey: true });
        expect(Number(canvas.style.zoom)).toBe(2);
        // Podłoga NIE jest stałą: to powiększenie, przy którym cała wysokość drzewa
        // (1394 px) mieści się w płótnie (600 px). Dalej oddalanie niczego nie odsłania.
        for (let i = 0; i < 80; i += 1) fireEvent.wheel(scroll, { deltaY: 100, ctrlKey: true });
        expect(Number(canvas.style.zoom)).toBeCloseTo(600 / 1394, 5);
    });

    it("przy niskim drzewie podłoga nie wypycha widoku powyżej 100%", () => {
        // Drzewo niższe od płótna zmieściłoby się „w całości" dopiero powyżej 1:1.
        // Gdyby podłoga to przyjęła, nie dałoby się wrócić do normalnego widoku.
        render(<TypesTreeGraph layout={{ ...layoutOf([node()]), height: 300 }} />);
        const scroll = screen.getByTestId("types-tree-scroll");
        const canvas = screen.getByTestId("types-tree-canvas");
        sizeScroll(scroll, 1300, 600);
        for (let i = 0; i < 40; i += 1) fireEvent.wheel(scroll, { deltaY: 100, ctrlKey: true });
        expect(Number(canvas.style.zoom)).toBe(1);
    });

    it("ciągnięcie tła przesuwa płótno w obu osiach, ciągnięcie kafla nie rusza nic", () => {
        render(<TypesTreeGraph layout={layoutOf([node()])} />);
        const scroll = screen.getByTestId("types-tree-scroll");
        scroll.scrollLeft = 100;
        scroll.scrollTop = 50;
        // Strona stoi w miejscu - rusza się samo płótno (decyzja ownera 2026-08-24).
        const down = pointer("pointerdown", 500, 300);
        fireEvent(scroll, down);
        // Bez preventDefault przeglądarka po kilku pikselach zaczyna zaznaczać tekst
        // i przeciąganie się urywa.
        expect(down.defaultPrevented).toBe(true);
        fireEvent(scroll, pointer("pointermove", 460, 280));
        expect(scroll.scrollLeft).toBe(140);
        expect(scroll.scrollTop).toBe(70);
        fireEvent(scroll, pointer("pointerup", 460, 280));

        // Kafel zostaje klikalny: gdyby ciągnięcie łapało też kafle, drgnięcie myszy
        // przy kliknięciu przesuwałoby widok zamiast otwierać panel.
        scroll.scrollLeft = 100;
        scroll.scrollTop = 50;
        fireEvent(tile("caseType:45"), pointer("pointerdown", 500, 300));
        fireEvent(scroll, pointer("pointermove", 460, 280));
        expect(scroll.scrollLeft).toBe(100);
        expect(scroll.scrollTop).toBe(50);
    });

    it("pusty układ zostaje komunikatem, nie pustym płótnem", () => {
        // Od kolumny zerowej pusty układ znaczy już tylko „nie wybrano typu umowy":
        // typ bez kamieni ma własny kafel i tłumaczy się sam.
        render(<TypesTreeGraph layout={{ nodes: [], edges: [], width: 0, height: 0, summary: EMPTY_SUMMARY }} />);
        expect(screen.getByText(/Nie wybrano typu umowy/)).toBeInTheDocument();
        expect(screen.queryByTestId("types-tree-canvas")).toBeNull();
    });

    it("nie pokazuje przycisku dopasowania, gdy wszystkie typy spraw mieszczą się w widoku", () => {
        // Przycisk, który stoi zawsze, przestaje być informacją. Ma się pojawiać
        // wyłącznie wtedy, gdy jest po co go klikać.
        const layout = layoutOf([node({ y: 20 }), node({ id: "caseType:46", entityId: 46, y: 80 })]);
        render(<TypesTreeGraph layout={layout} />);
        const scroll = screen.getByTestId("types-tree-scroll");
        sizeScroll(scroll, 1300, 600);
        fireEvent.scroll(scroll);
        expect(screen.queryByTestId("types-tree-fit")).toBeNull();
    });

    it("przy najwyższej kolumnie spraw lupa daje dokładnie to samo, co kółko do oporu", () => {
        // Płótno 962 px = najniższy kafel (942) plus margines układu (20). Skoro gałąź jest
        // najwyższą rzeczą na płótnie, dopasowanie musi zmieścić CAŁE płótno - inaczej te
        // dwa marginesy wracają jako pasek przewijania (zgłoszenie ownera 2026-08-28).
        const layout = { ...layoutOf([node({ y: 20 }), node({ id: "caseType:46", entityId: 46, y: 900 })]), height: 962 };
        render(<TypesTreeGraph layout={layout} />);
        const scroll = screen.getByTestId("types-tree-scroll");
        const canvas = screen.getByTestId("types-tree-canvas");
        sizeScroll(scroll, 1300, 600);
        fireEvent.scroll(scroll);

        fireEvent.click(screen.getByTestId("types-tree-fit"));

        const afterFit = Number(canvas.style.zoom);
        expect(afterFit).toBeCloseTo(600 / 962, 5);
        // Płótno mieści się w pionie co do piksela, więc nie ma czego przewijać.
        expect(scroll.scrollTop).toBeCloseTo(0, 5);
        // I to jest maksymalne oddalenie: dokręcanie kółkiem już niczego nie zmienia.
        for (let i = 0; i < 40; i += 1) fireEvent.wheel(scroll, { deltaY: 100, ctrlKey: true });
        expect(Number(canvas.style.zoom)).toBeCloseTo(afterFit, 10);
        // Skoro widać już wszystko, przycisk nie ma czego obiecywać.
        expect(screen.queryByTestId("types-tree-fit")).toBeNull();
    });

    it("kolumna typów umów nie dyktuje powiększenia", () => {
        // Odwrotny przypadek: to lista typów umów jest najwyższa. Wtedy dopasowanie ma zmieścić
        // samą gałąź i zostawić pasek przewijania - owner ustalił, że wszystkie typy umów naraz
        // widoczne być NIE muszą.
        const layout = {
            ...layoutOf([
                node({ id: "contractType:3", kind: "contractType", entityId: 3, x: 0, y: 1000, w: 230 }),
                node({ y: 20 }),
                node({ id: "caseType:46", entityId: 46, y: 700 }),
            ]),
            height: 1062,
        };
        render(<TypesTreeGraph layout={layout} />);
        const scroll = screen.getByTestId("types-tree-scroll");
        const canvas = screen.getByTestId("types-tree-canvas");
        sizeScroll(scroll, 1300, 600);
        fireEvent.scroll(scroll);

        fireEvent.click(screen.getByTestId("types-tree-fit"));

        // Gdyby liczyła się cała wysokość płótna, wyszłoby 600/1062. Gałąź jest niższa,
        // więc powiększenie musi być większe - i wszystkie typy spraw dalej widać.
        expect(Number(canvas.style.zoom)).toBeGreaterThan(600 / 1062);
        expect(screen.queryByTestId("types-tree-fit")).toBeNull();
    });

    it("przycisk dopasowania nie nadpisuje koloru ani tła", () => {
        // Regres z pierwszej wersji: wariant „outline-secondary" ustawia na najechaniu BIAŁY
        // znak, a tło było nadpisane inline na białe - przycisk robił się pusty. Wariant
        // „light" trzyma czarny znak w każdym stanie, więc wystarczy mu nie przeszkadzać.
        const layout = layoutOf([node({ y: 20 }), node({ id: "caseType:46", entityId: 46, y: 900 })]);
        render(<TypesTreeGraph layout={layout} />);
        const scroll = screen.getByTestId("types-tree-scroll");
        sizeScroll(scroll, 1300, 600);
        fireEvent.scroll(scroll);

        const fit = screen.getByTestId("types-tree-fit");
        expect(fit.className).toContain("btn-light");
        expect(fit.className).not.toContain("outline");
        expect(fit.style.color).toBe("");
        expect(fit.style.background).toBe("");
    });

    it("nie pokazuje przycisku dopasowania, gdy kolumna spraw jest zwinięta", () => {
        // Przy głębokości „kamienie" typów spraw w układzie w ogóle nie ma - przycisk
        // obiecywałby wtedy pokazanie czegoś, czego nie da się pokazać.
        const layout = layoutOf([node({ id: "milestoneType:6", kind: "milestoneType", entityId: 6, y: 900 })]);
        render(<TypesTreeGraph layout={layout} />);
        const scroll = screen.getByTestId("types-tree-scroll");
        sizeScroll(scroll, 1300, 600);
        fireEvent.scroll(scroll);
        expect(screen.queryByTestId("types-tree-fit")).toBeNull();
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
        expect(screen.getByTestId("types-tree-hidden-count").title).toBe("Ukryte: 5 typów kamieni");
        expect(tile("contractType:14").getAttribute("title")).toBeNull();
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
