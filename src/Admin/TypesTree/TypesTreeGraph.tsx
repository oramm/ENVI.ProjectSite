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
 * Komponent jest celowo głupi i bezstanowy: cały układ liczy typesTreeLayout.
 */

const FILL: Record<string, string> = {
    contractType: "#0d6efd",
    milestoneType: "#20c997",
    caseType: "#f7941d",
    subCaseType: "#adb5bd",
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
    return node.description ? `${node.label}\n\n${node.description}` : node.label;
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

function NodeTile({
    node,
    isSelected,
    onNodeClick,
}: {
    node: LayoutNode;
    isSelected: boolean;
    onNodeClick?: (node: LayoutNode) => void;
}) {
    const color = FILL[node.kind];
    const tasks = node.tasks ?? [];
    // Zadania schowane przełącznikiem nie znikają bez śladu - zostaje licznik.
    const hiddenTaskCount = tasks.length ? 0 : node.taskCount ?? 0;
    return (
        <div
            data-testid="types-tree-node"
            data-node-id={node.id}
            title={nodeTitle(node)}
            onClick={() => onNodeClick?.(node)}
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
                border: `${isSelected ? 3 : 1.5}px ${node.isSubCaseOnly ? "dashed" : "solid"} ${
                    isSelected ? "#0d6efd" : color
                }`,
                cursor: onNodeClick ? "pointer" : "default",
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
                        color: "#212529",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                        // Odstęp tylko wtedy, gdy jest od czego - bez licznika kafel
                        // wygląda co do piksela tak, jak przed tą zmianą.
                        marginRight: hiddenTaskCount > 0 ? 6 : 0,
                    }}
                >
                    {node.label}
                </span>
                {hiddenTaskCount > 0 && (
                    <span
                        data-testid="types-tree-task-count"
                        title={`Zadania startowe: ${hiddenTaskCount}. Włącz przełącznik „Zadania", żeby je zobaczyć.`}
                        style={{
                            marginLeft: "auto",
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
}: {
    layout: Layout;
    selectedNodeId?: string | null;
    onNodeClick?: (node: LayoutNode) => void;
}) {
    if (!layout.nodes.length) {
        return <div className="text-muted p-3">Ten typ umowy nie ma przypisanych typów kamieni milowych.</div>;
    }

    const byId = new Map(layout.nodes.map((node) => [node.id, node]));

    return (
        // Bez własnego przewijania w pionie: karta rośnie na pełną wysokość drzewa,
        // a przewija się cała strona. Zagnieżdżony pasek zmuszałby do przewijania
        // dwóch rzeczy naraz i ucinał obraz w połowie gałęzi.
        //
        // W poziomie zostaje overflow, bo głębokie drzewo bywa szersze niż karta.
        // Wyśrodkowanie przez margin auto, NIE przez flexa: ten przy zawartości
        // szerszej od kontenera wypycha ją poza obie krawędzie i lewej strony
        // nie da się doscrollować.
        <div data-testid="types-tree-scroll" style={{ overflowX: "auto", maxWidth: "100%" }}>
            <div
                data-testid="types-tree-canvas"
                role="group"
                aria-label="Hierarchia typów"
                style={{
                    position: "relative",
                    width: layout.width,
                    height: layout.height,
                    margin: "0 auto",
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
                    />
                ))}
            </div>
        </div>
    );
}
