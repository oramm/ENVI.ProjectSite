import {
    TypesTreeData,
    caseTypesForMilestoneType,
    hasTemplateGap,
    isCreatedAutomatically,
    milestoneTypesForContractType,
    subCaseTypesFor,
} from "./typesTreeModel";

/**
 * Rozkład grafu hierarchii na współrzędne.
 *
 * Czysta funkcja - zero Reacta i zero SVG. Dzięki temu układ da się przetestować
 * bez renderowania, a komponent rysujący jest głupi i bezstanowy.
 *
 * DWA PRZEBIEGI, i to jest tu istotne. Ten sam typ podsprawy bywa dopuszczony pod
 * kilkoma rodzicami (np. „Odcinek” pod pięcioma sprawami), a rysujemy go jako JEDEN
 * węzeł. Gdyby umieszczać go od razu przy pierwszym napotkanym rodzicu, wylądowałby
 * wysoko, podczas gdy jego rodzice byliby daleko niżej. Dlatego:
 *   przebieg 1 - kamienie i sprawy (kolumny 1 i 2),
 *   przebieg 2 - podsprawy, każda na średniej wysokości WSZYSTKICH swoich rodziców.
 *
 * Rodzic jest wyśrodkowany względem dzieci, a nie dosunięty do góry.
 */

export type NodeKind = "contractType" | "milestoneType" | "caseType" | "subCaseType";

export type LayoutNode = {
    id: string;
    kind: NodeKind;
    entityId: number;
    label: string;
    badge?: string;
    /** Typ dopuszczalny wyłącznie jako podsprawa - rysowany przerywaną obwódką. */
    isSubCaseOnly?: boolean;
    /** Czy typ ma szablon - bez niego nie powstaje automatycznie. */
    hasTemplate?: boolean;
    description?: string;
    x: number;
    y: number;
    w: number;
    h: number;
};

export type LayoutEdge = {
    fromId: string;
    toId: string;
    /** Numer folderu - należy do KRAWĘDZI, nie do węzła, więc rysowany na linii. */
    label?: string;
    /** Powstaje samo przy nowej umowie: flaga „domyślny” ORAZ szablon. */
    isDefault?: boolean;
    /** Oznaczone jako domyślne, ale bez szablonu - nie powstanie. */
    hasGap?: boolean;
};

export type Layout = {
    nodes: LayoutNode[];
    edges: LayoutEdge[];
    width: number;
    height: number;
};

// Szerszy odstęp między kolumnami niż same prostokąty: linie mają wtedy dłuższy,
// łagodniejszy łuk i widać, które dziecko należy do którego rodzica.
const COL_X = [0, 330, 660, 1010];
const NODE_W = [230, 230, 260, 230];
const NODE_H = 42;
const GAP_Y = 10;
const GROUP_GAP = 16;
const PAD = 20;

/** Środek pionowy zbioru węzłów; null dla zbioru pustego. */
function centerOf(nodes: LayoutNode[]): number | null {
    if (!nodes.length) return null;
    const top = Math.min(...nodes.map((node) => node.y));
    const bottom = Math.max(...nodes.map((node) => node.y + node.h));
    return (top + bottom) / 2 - NODE_H / 2;
}

export function layout(data: TypesTreeData, selectedContractTypeId: number | null): Layout {
    const contractType = data.contractTypes.find((type) => type.id === selectedContractTypeId);
    if (!contractType) return { nodes: [], edges: [], width: 0, height: 0 };

    const nodes: LayoutNode[] = [];
    const edges: LayoutEdge[] = [];
    const nextFree = [PAD, PAD, PAD, PAD];

    function makeNode(
        kind: NodeKind,
        column: number,
        entityId: number,
        label: string,
        preferredY: number | null,
        extra: Partial<LayoutNode> = {},
    ): LayoutNode {
        const y = Math.max(preferredY ?? nextFree[column], nextFree[column]);
        const node: LayoutNode = {
            id: `${kind}:${entityId}`,
            kind,
            entityId,
            label,
            x: COL_X[column],
            y,
            w: NODE_W[column],
            h: NODE_H,
            ...extra,
        };
        nodes.push(node);
        nextFree[column] = y + NODE_H + GAP_Y;
        return node;
    }

    /* ---------- przebieg 1: kamienie i sprawy ---------- */

    const milestoneNodes: LayoutNode[] = [];
    /** Identyfikatory węzłów spraw zakładanych automatycznie razem z kamieniem. */
    const defaultCaseNodeIds = new Set<string>();
    /** Węzły oznaczone jako domyślne, ale bez szablonu - nie powstaną. */
    const gapNodeIds = new Set<string>();
    /** subCaseTypeId -> węzły spraw, pod którymi jest dopuszczony. */
    const parentsOfSubCase = new Map<number, LayoutNode[]>();
    /** subCaseTypeId -> dane typu, potrzebne przy tworzeniu węzła w przebiegu 2. */
    const subCaseTypeById = new Map<number, ReturnType<typeof subCaseTypesFor>[number]>();

    for (const { milestoneType } of milestoneTypesForContractType(data, contractType.id)) {
        const caseNodes: LayoutNode[] = [];

        for (const caseType of caseTypesForMilestoneType(data, milestoneType.id)) {
            const caseNode = makeNode("caseType", 2, caseType.id, caseType.name, null, {
                badge: caseType.folderNumber ?? undefined,
                description: caseType.description,
            });
            caseNodes.push(caseNode);
            // Flagę „domyślny” typu sprawy niesie krawędź z kamienia - tak samo jak
            // przy kamieniach. Dzięki temu jednym rzutem oka widać, które sprawy
            // powstają automatycznie przy zakładaniu umowy.
            if (isCreatedAutomatically(caseType)) defaultCaseNodeIds.add(caseNode.id);
            if (hasTemplateGap(caseType)) gapNodeIds.add(caseNode.id);

            for (const subCaseType of subCaseTypesFor(data, caseType.id)) {
                subCaseTypeById.set(subCaseType.id, subCaseType);
                const parents = parentsOfSubCase.get(subCaseType.id) ?? [];
                parents.push(caseNode);
                parentsOfSubCase.set(subCaseType.id, parents);
            }
        }

        const milestoneNode = makeNode("milestoneType", 1, milestoneType.id, milestoneType.name, centerOf(caseNodes), {
            description: milestoneType.description,
            hasTemplate: milestoneType._templateId !== null,
        });
        milestoneNodes.push(milestoneNode);
        caseNodes.forEach((caseNode) =>
            edges.push({
                fromId: milestoneNode.id,
                toId: caseNode.id,
                isDefault: defaultCaseNodeIds.has(caseNode.id),
                hasGap: gapNodeIds.has(caseNode.id),
            }),
        );

        // Odstęp między gałęziami, żeby sprawy jednego kamienia nie zlewały się
        // wizualnie ze sprawami następnego.
        nextFree[2] += GROUP_GAP;
    }

    /* ---------- przebieg 2: podsprawy, przy swoich rodzicach ---------- */

    // Kolejność wg docelowej wysokości, żeby przycinanie do wolnego miejsca
    // nie poprzestawiało węzłów względem siebie.
    const subCaseOrder = Array.from(parentsOfSubCase.entries())
        .map(([subCaseTypeId, parents]) => ({ subCaseTypeId, parents, desiredY: centerOf(parents) ?? 0 }))
        .sort((a, b) => a.desiredY - b.desiredY);

    for (const { subCaseTypeId, parents, desiredY } of subCaseOrder) {
        const subCaseType = subCaseTypeById.get(subCaseTypeId);
        if (!subCaseType) continue;

        // Typ dopuszczony i jako zwykła sprawa, i jako podsprawa dostaje prostokąt
        // w OBU kolumnach - to nie jest duplikat, tylko dwie różne role tego samego
        // typu. Identyfikatory węzłów są rozłączne (caseType: / subCaseType:),
        // więc zaznaczenie i edycja działają na każdym z osobna.
        const subCaseNode = makeNode("subCaseType", 3, subCaseType.id, subCaseType.name, desiredY, {
            badge: subCaseType.folderNumber ?? undefined,
            isSubCaseOnly: subCaseType.isSubCaseOnly,
            description: subCaseType.description,
        });
        parents.forEach((parent) => edges.push({ fromId: parent.id, toId: subCaseNode.id }));
    }

    /* ---------- typ umowy, wyśrodkowany na kamieniach ---------- */

    const contractNode = makeNode("contractType", 0, contractType.id, contractType.name, centerOf(milestoneNodes), {
        badge: contractType.status === "OLD" ? "wycofany" : undefined,
        description: contractType.description,
    });
    milestoneNodes.forEach((milestoneNode) => {
        const edge = data.contractTypeMilestoneTypes.find(
            (candidate) =>
                candidate.contractTypeId === contractType.id &&
                candidate.milestoneTypeId === milestoneNode.entityId,
        );
        edges.push({
            fromId: contractNode.id,
            toId: milestoneNode.id,
            label: edge?.folderNumber ?? undefined,
            // Zielona linia znaczy „powstaje samo", a to wymaga flagi I szablonu.
            isDefault: !!edge?.isDefault && milestoneNode.hasTemplate,
            hasGap: !!edge?.isDefault && !milestoneNode.hasTemplate,
        });
    });

    // Szerokość liczona z faktycznie użytych kolumn - gdy nie ma podspraw, nie
    // rezerwujemy pustego pasa po prawej, dzięki czemu graf da się wyśrodkować.
    const width = Math.max(...nodes.map((node) => node.x + node.w)) + PAD;
    const height = Math.max(...nodes.map((node) => node.y + node.h)) + PAD;
    return { nodes, edges, width, height };
}
