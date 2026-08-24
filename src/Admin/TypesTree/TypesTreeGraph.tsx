import React from "react";
import { Layout, LayoutNode, LayoutTask } from "./typesTreeLayout";

/**
 * Renderer grafu hierarchii - dwie warstwy, bez nowej zależności.
 *
 * Linie i numery folderów zostają w SVG, bo są krzywymi. Kafle rysuje HTML
 * pozycjonowany absolutnie NAD tą warstwą: kafel ma być wielowierszowy (lista
 * zadań, chevron, licznik), a w SVG każda taka rzecz to ręczne liczenie tekstu.
 * Pierwszą ofiarą tamtego liczenia było ucinanie nazwy na sztywno po 26 znakach
 * - teraz robi to CSS, a pełna nazwa zostaje w podpowiedzi.
 *
 * Komponent jest celowo głupi: cały układ liczy typesTreeLayout. Własnego stanu ma
 * tyle, co powiększenie i przeciąganie widoku - to obsługa myszy, nie układ.
 */

const FILL: Record<string, string> = {
    contractType: "#0d6efd",
    milestoneType: "#20c997",
    caseType: "#f7941d",
    subCaseType: "#adb5bd",
    emptyBranch: "#adb5bd",
};

/**
 * Fiolet dla zadań startowych - kolor w tym widoku dotąd nieużywany.
 *
 * Nie da się tu sięgnąć po zieleń ani pomarańcz: zielona linia znaczy „powstaje samo
 * przy nowej umowie", pomarańczowa przerywana „domyślne bez szablonu, nie powstanie",
 * a pomarańcz kafla to rodzaj „sprawa". Nowy sygnał nie zajmuje zajętego miejsca.
 */
const TASK_COLOR = "#6f42c1";

function nodeTitle(node: LayoutNode) {
    const lines: string[] = [];
    // E2 zostawia na kaflu samo przekreślenie, więc pełne słowo musi być tutaj -
    // inaczej znacznik nie mówi, DLACZEGO nazwa jest przekreślona.
    if (node.isRetired) lines.push("Ten typ umowy jest wycofany.");
    if (node.description) lines.push(node.description);
    // Nazwy ani licznika ukrytych dzieci tu nie ma CELOWO (decyzja ownera 2026-08-24):
    // nazwa stoi na kaflu, a licznik ma własną plakietkę „+N" z własną podpowiedzią.
    // Brak treści = brak atrybutu, nie pusty dymek.
    return lines.join("\n\n") || undefined;
}

/** Krzywa Béziera z prawej krawędzi węzła źródłowego do lewej krawędzi celu. */
function edgePath(from: LayoutNode, to: LayoutNode) {
    const x1 = from.x + from.w;
    const y1 = from.anchorY;
    const x2 = to.x;
    const y2 = to.anchorY;
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}

/** Slot na numer folderu - w SVG była to różnica 46 - 12 współrzędnych tekstu. */
const BADGE_SLOT = 34;
const PAD_X = 12;

const TASK_ROW_H = 20;

/**
 * Wysokość płótna. Odjęte 210 px to wszystko, co stoi nad płótnem i pod nim: pasek nawigacji,
 * pasek narzędzi karty i stopka strony. Liczba wzięta z POMIARU, nie z oka: przy 200 px strona
 * przewijała się o 7 px. Było 280 px, dopóki nad drzewem stał nagłówek strony z przyciskami,
 * a pod nim przycisk „Nieprzypisane typy" - oba przeniesione, więc płótno dostało te 70 px.
 */
const CANVAS_HEIGHT = "calc(100vh - 210px)";

/**
 * Wiersz zadania startowego wewnątrz kafla sprawy.
 *
 * Wnętrze kafla jest o 3 px węższe, niż mówi szerokość węzła (obwódka HTML leży
 * w całości wewnątrz), więc nazwa dostaje ellipsis, a nie sztywne ucinanie.
 */
function TaskRow({ task }: { task: LayoutTask }) {
    return (
        <div
            data-testid="types-tree-task"
            title={task.status ? `${task.name} (${task.status})` : task.name}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: TASK_ROW_H,
                minWidth: 0,
            }}
        >
            <span style={{ flex: "0 0 5px", width: 5, height: 5, borderRadius: 3, background: TASK_COLOR }} />
            <span
                style={{
                    fontSize: 11,
                    color: TASK_COLOR,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                }}
            >
                {task.name}
            </span>
            {/* „Backlog" znaczy: zadanie czeka poza bieżącą listą. Szare, nie fioletowe -
                fiolet niesie tu „to jest zadanie", status nie może mu tego odbierać. */}
            {task.status === "Backlog" && (
                <span
                    style={{
                        marginLeft: "auto",
                        flex: "0 0 auto",
                        fontSize: 9,
                        lineHeight: "12px",
                        color: "#6c757d",
                        border: "1px solid #dee2e6",
                        borderRadius: 3,
                        padding: "0 3px",
                    }}
                >
                    Backlog
                </span>
            )}
        </div>
    );
}

/**
 * Chevron zwijający gałąź. Osobny przycisk, nie całe pole kafla, bo klik w kafel
 * ma już swoje znaczenie (zaznacz, a przy drugim - edytuj) i nie wolno mu go odbierać.
 */
function Chevron({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            data-testid="types-tree-chevron"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Zwiń gałąź" : "Rozwiń gałąź"}
            title={isExpanded ? "Zwiń gałąź" : "Rozwiń gałąź"}
            onClick={(event) => {
                // Bez tego klik doszedłby do kafla i przy okazji otworzył edycję.
                event.stopPropagation();
                onToggle();
            }}
            style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                padding: 0,
                border: "none",
                background: "transparent",
                color: "#6c757d",
                cursor: "pointer",
                lineHeight: 0,
            }}
        >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                {/* Strzałka w dół = gałąź rozwinięta, w prawo = zwinięta. */}
                <path
                    d={isExpanded ? "M 1 3 L 5 7 L 9 3" : "M 3 1 L 7 5 L 3 9"}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}

function NodeTile({
    node,
    isSelected,
    onNodeClick,
    onToggleCollapse,
}: {
    node: LayoutNode;
    isSelected: boolean;
    onNodeClick?: (node: LayoutNode) => void;
    onToggleCollapse?: (node: LayoutNode) => void;
}) {
    const color = FILL[node.kind];
    const tasks = node.tasks ?? [];
    // Zadania schowane przełącznikiem nie znikają bez śladu - zostaje licznik.
    const hiddenTaskCount = tasks.length ? 0 : node.taskCount ?? 0;
    // Dzieci schowane zwinięciem albo globalną głębokością - też zostaje licznik.
    const hiddenCount = node.hiddenCount ?? 0;
    const hasChevron = Boolean(node.canCollapse && onToggleCollapse);
    const hasTrailing = hiddenTaskCount > 0 || hiddenCount > 0 || hasChevron;
    // Kafel „brak przypisanych kamieni" jest wyjaśnieniem, nie węzłem - nie ma
    // czego zaznaczać ani edytować, więc nie udaje klikalnego.
    const isExplanation = node.kind === "emptyBranch";
    const isClickable = Boolean(onNodeClick) && !isExplanation;
    // Wybrany typ umowy JEST zaznaczeniem tego widoku - to on decyduje, którą
    // gałąź widać. Rysujemy go tak samo jak zaznaczony węzeł, bo to ta sama rzecz.
    const isEmphasized = isSelected || (node.kind === "contractType" && node.isDimmed === false);
    return (
        <div
            data-testid="types-tree-node"
            data-node-id={node.id}
            data-retired={node.isRetired ? "true" : undefined}
            data-dimmed={node.isDimmed ? "true" : undefined}
            title={nodeTitle(node)}
            onClick={isClickable ? () => onNodeClick?.(node) : undefined}
            style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                width: node.w,
                height: node.h,
                boxSizing: "border-box",
                // Kolumna, nie wiersz: pod nagłówkiem z nazwą wisi lista zadań.
                // Nagłówek bierze całą resztę wysokości, więc przy kaflu bez zadań
                // wychodzi dokładnie to samo, co przed zmianą.
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                background: "#fff",
                borderRadius: 6,
                // Przerywana obwódka znaczy "wyłącznie jako podsprawa" - znaczenie
                // przeniesione 1:1 ze strokeDasharray, nie osłabione.
                // Przerywana obwódka niesie tu dwa znaczenia, ale w rozłącznych
                // kolumnach: w kolumnie podspraw „wyłącznie jako podsprawa",
                // w kolumnie kamieni pusty stan gałęzi, który nazywa się sam.
                border: `${isEmphasized ? 3 : 1.5}px ${
                    node.isSubCaseOnly || isExplanation ? "dashed" : "solid"
                } ${isEmphasized ? "#0d6efd" : color}`,
                cursor: isClickable ? "pointer" : "default",
                // Przygaszony kafel = gałąź, której teraz nie widać. Sygnał
                // celowo słaby: ma ustąpić pierwszeństwa wybranej gałęzi.
                opacity: node.isDimmed ? 0.55 : 1,
                overflow: "hidden",
            }}
        >
            {/* Listwa rodzaju - ta sama rola co prostokąt 4 px w SVG. */}
            <span
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    borderRadius: 2,
                    background: color,
                }}
            />
            <div
                data-testid="types-tree-node-header"
                style={{
                    flex: "1 1 auto",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: PAD_X,
                    paddingRight: 10,
                    minWidth: 0,
                }}
            >
                {node.badge && (
                    <span
                        style={{
                            flex: `0 0 ${BADGE_SLOT}px`,
                            fontSize: 11,
                            fontFamily: "monospace",
                            color: "#6c757d",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {node.badge}
                    </span>
                )}
                <span
                    style={{
                        fontSize: 12,
                        color: isExplanation ? "#6c757d" : "#212529",
                        fontStyle: isExplanation ? "italic" : undefined,
                        // E2: sama przekreślona nazwa, bez plakietki „wycofany" -
                        // plakietka w kolumnie 230 px zjadałaby nazwę.
                        textDecoration: node.isRetired ? "line-through" : undefined,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                        // Odstęp tylko wtedy, gdy jest od czego - bez liczników i bez
                        // chevronu kafel wygląda co do piksela tak, jak przed zmianą.
                        marginRight: hasTrailing ? 6 : 0,
                    }}
                >
                    {node.label}
                </span>
                {/* Prawa strona nagłówka: liczniki i chevron zawsze w tym samym
                    miejscu, żeby wzrok nie musiał ich szukać po kaflach. */}
                {hasTrailing && (
                    <span
                        style={{
                            marginLeft: "auto",
                            flex: "0 0 auto",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        {hiddenTaskCount > 0 && (
                            <span
                                data-testid="types-tree-task-count"
                                title={`Zadania startowe: ${hiddenTaskCount}. Włącz przełącznik „Zadania", żeby je zobaczyć.`}
                                style={{
                                    flex: "0 0 auto",
                                    fontSize: 10,
                                    lineHeight: "14px",
                                    color: TASK_COLOR,
                                    border: `1px solid ${TASK_COLOR}`,
                                    borderRadius: 8,
                                    padding: "0 5px",
                                }}
                            >
                                {hiddenTaskCount} zad.
                            </span>
                        )}
                        {hiddenCount > 0 && (
                            <span
                                data-testid="types-tree-hidden-count"
                                title={node.hiddenLabel}
                                style={{
                                    flex: "0 0 auto",
                                    fontSize: 10,
                                    lineHeight: "14px",
                                    color: "#495057",
                                    background: "#e9ecef",
                                    borderRadius: 8,
                                    padding: "0 5px",
                                }}
                            >
                                +{hiddenCount}
                            </span>
                        )}
                        {hasChevron && (
                            <Chevron
                                isExpanded={Boolean(node.isExpanded)}
                                onToggle={() => onToggleCollapse?.(node)}
                            />
                        )}
                    </span>
                )}
            </div>
            {tasks.length > 0 && (
                <div
                    data-testid="types-tree-task-list"
                    style={{
                        flex: "0 0 auto",
                        borderTop: "1px solid #e9ecef",
                        paddingTop: 3,
                        paddingLeft: PAD_X,
                        paddingRight: 10,
                    }}
                >
                    {tasks.map((task) => (
                        <TaskRow key={task.id} task={task} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function TypesTreeGraph({
    layout,
    selectedNodeId,
    onNodeClick,
    onToggleCollapse,
}: {
    layout: Layout;
    selectedNodeId?: string | null;
    onNodeClick?: (node: LayoutNode) => void;
    onToggleCollapse?: (node: LayoutNode) => void;
}) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const panRef = React.useRef<{ x: number; y: number; left: number; top: number } | null>(null);
    const [zoom, setZoom] = React.useState(1);

    // Ctrl+kółko przybliża. Listener wieszany ręcznie, bo React podpina „wheel" jako
    // pasywny - preventDefault w propsie nic by nie dał i przybliżałaby się cała strona.
    React.useEffect(() => {
        const scroll = scrollRef.current;
        if (!scroll) return;
        const onWheel = (event: WheelEvent) => {
            if (!event.ctrlKey) return;
            event.preventDefault();
            setZoom((current) => Math.min(2, Math.max(0.4, current * (event.deltaY < 0 ? 1.1 : 1 / 1.1))));
        };
        scroll.addEventListener("wheel", onWheel, { passive: false });
        return () => scroll.removeEventListener("wheel", onWheel);
        // layout w zależnościach, bo przy pustym drzewie kontenera jeszcze nie ma.
    }, [layout]);

    // Przeciąganie TŁA przesuwa widok w OBU osiach - wewnątrz kontenera, nie stroną.
    // `preventDefault` na wciśnięciu: bez niego przeglądarka po kilku pikselach uznaje
    // ruch za zaznaczanie tekstu i przeciąganie się urywa.
    // Kafle, chevrony i plakietki zostają klikalne, bo ciągnie się wyłącznie tło.
    const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
        const scroll = scrollRef.current;
        if (!scroll || event.button !== 0) return;
        if ((event.target as HTMLElement).closest("[data-node-id]")) return;
        event.preventDefault();
        panRef.current = { x: event.clientX, y: event.clientY, left: scroll.scrollLeft, top: scroll.scrollTop };
        scroll.setPointerCapture(event.pointerId);
    };
    const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
        const pan = panRef.current;
        const scroll = scrollRef.current;
        if (!pan || !scroll) return;
        scroll.scrollLeft = pan.left - (event.clientX - pan.x);
        scroll.scrollTop = pan.top - (event.clientY - pan.y);
    };
    const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!panRef.current) return;
        panRef.current = null;
        scrollRef.current?.releasePointerCapture(event.pointerId);
    };

    if (!layout.nodes.length) {
        // Od kolumny zerowej pusta jest już tylko sytuacja „nie wybrano typu" -
        // typ bez kamieni ma własny kafel w kolumnie kamieni i tłumaczy się sam.
        return <div className="text-muted p-3">Nie wybrano typu umowy.</div>;
    }

    const byId = new Map(layout.nodes.map((node) => [node.id, node]));

    return (
        // Płótno o ograniczonej wysokości z własnym przewijaniem w OBU osiach.
        // Wcześniej karta rosła na pełną wysokość drzewa i przewijała się cała strona;
        // owner poprosił 2026-08-24, żeby ruszało się samo płótno, a strona stała.
        // Wysokość liczona od okna, żeby nagłówek strony, pasek narzędzi i przycisk
        // pod drzewem zostały widoczne.
        //
        // Wyśrodkowanie przez margin auto, NIE przez flexa: ten przy zawartości
        // szerszej od kontenera wypycha ją poza obie krawędzie i lewej strony
        // nie da się doscrollować.
        <div
            data-testid="types-tree-scroll"
            ref={scrollRef}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            style={{
                overflow: "auto",
                maxWidth: "100%",
                height: CANVAS_HEIGHT,
                minHeight: 320,
                cursor: "grab",
                // Zaznaczanie tekstu psuło przeciąganie; w drzewie nie ma czego zaznaczać.
                userSelect: "none",
                // Dojechanie do krawędzi płótna nie przewija strony pod spodem.
                overscrollBehavior: "contain",
            }}
        >
            <div
                data-testid="types-tree-canvas"
                role="group"
                aria-label="Hierarchia typów"
                style={{
                    position: "relative",
                    width: layout.width,
                    height: layout.height,
                    margin: "0 auto",
                    // Powiększenie z Ctrl+kółka. Właściwość „zoom", nie „transform: scale":
                    // zoom zmienia układ, więc pasek przewijania sam wie, ile miejsca zajmuje
                    // drzewo - przy transformacji trzeba by przeliczać płótno ręcznie.
                    zoom,
                }}
            >
                <svg
                    width={layout.width}
                    height={layout.height}
                    viewBox={`0 0 ${layout.width} ${layout.height}`}
                    aria-hidden="true"
                    style={{ position: "absolute", left: 0, top: 0, display: "block" }}
                >
                    {layout.edges.map((edge, index) => {
                        const from = byId.get(edge.fromId);
                        const to = byId.get(edge.toId);
                        if (!from || !to) return null;
                        const path = edgePath(from, to);
                        const midX = (from.x + from.w + to.x) / 2;
                        const midY = (from.y + from.h / 2 + to.y + to.h / 2) / 2;
                        return (
                            <g key={`${edge.fromId}->${edge.toId}-${index}`}>
                                {/* Pomarańczowa przerywana = oznaczone jako domyślne, ale bez
                                    szablonu, więc mimo flagi nie powstanie. */}
                                <path
                                    d={path}
                                    fill="none"
                                    stroke={edge.hasGap ? "#fd7e14" : edge.isDefault ? "#198754" : "#ced4da"}
                                    strokeWidth={edge.isDefault || edge.hasGap ? 2.5 : 1.5}
                                    strokeDasharray={edge.hasGap ? "6 4" : undefined}
                                />
                                {edge.label && (
                                    <>
                                        <rect x={midX - 13} y={midY - 9} width={26} height={18} rx={4} fill="#fff" />
                                        <text
                                            x={midX}
                                            y={midY + 4}
                                            textAnchor="middle"
                                            fontSize={11}
                                            fontFamily="monospace"
                                            fill="#495057"
                                        >
                                            {edge.label}
                                        </text>
                                    </>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {layout.nodes.map((node) => (
                    <NodeTile
                        key={node.id}
                        node={node}
                        isSelected={node.id === selectedNodeId}
                        onNodeClick={onNodeClick}
                        onToggleCollapse={onToggleCollapse}
                    />
                ))}
            </div>
        </div>
    );
}
