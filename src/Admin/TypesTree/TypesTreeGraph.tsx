import React from "react";
import { Layout, LayoutNode } from "./typesTreeLayout";

/**
 * Renderer grafu hierarchii - własny inline SVG, bez nowej zależności.
 *
 * Komponent jest celowo głupi i bezstanowy: cały układ liczy typesTreeLayout,
 * tutaj zostaje samo rysowanie.
 */

const FILL: Record<string, string> = {
    contractType: "#0d6efd",
    milestoneType: "#20c997",
    caseType: "#f7941d",
    subCaseType: "#adb5bd",
};

function nodeTitle(node: LayoutNode) {
    return node.description ? `${node.label}\n\n${node.description}` : node.label;
}

/** Krzywa Béziera z prawej krawędzi węzła źródłowego do lewej krawędzi celu. */
function edgePath(from: LayoutNode, to: LayoutNode) {
    const x1 = from.x + from.w;
    const y1 = from.y + from.h / 2;
    const x2 = to.x;
    const y2 = to.y + to.h / 2;
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
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
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <svg
                width={layout.width}
                height={layout.height}
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                role="img"
                aria-label="Hierarchia typów"
                style={{ display: "block", margin: "0 auto" }}
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
                            <path
                                d={path}
                                fill="none"
                                stroke={edge.isDefault ? "#198754" : "#ced4da"}
                                strokeWidth={edge.isDefault ? 2.5 : 1.5}
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

                {layout.nodes.map((node) => {
                    const isSelected = node.id === selectedNodeId;
                    return (
                        <g
                            key={node.id}
                            onClick={() => onNodeClick?.(node)}
                            style={{ cursor: onNodeClick ? "pointer" : "default" }}
                        >
                            <title>{nodeTitle(node)}</title>
                            <rect
                                x={node.x}
                                y={node.y}
                                width={node.w}
                                height={node.h}
                                rx={6}
                                fill="#fff"
                                stroke={isSelected ? "#0d6efd" : FILL[node.kind]}
                                strokeWidth={isSelected ? 3 : 1.5}
                                strokeDasharray={node.isSubCaseOnly ? "5 3" : undefined}
                            />
                            <rect x={node.x} y={node.y} width={4} height={node.h} rx={2} fill={FILL[node.kind]} />
                            {node.badge && (
                                <text
                                    x={node.x + 12}
                                    y={node.y + node.h / 2 + 4}
                                    fontSize={11}
                                    fontFamily="monospace"
                                    fill="#6c757d"
                                >
                                    {node.badge}
                                </text>
                            )}
                            <text
                                x={node.x + (node.badge ? 46 : 12)}
                                y={node.y + node.h / 2 + 4}
                                fontSize={12}
                                fill="#212529"
                            >
                                {node.label.length > 26 ? node.label.slice(0, 25) + "..." : node.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
