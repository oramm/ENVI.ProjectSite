import {
    TypesTreeData,
    TypesTreeCaseType,
    TypesTreeTaskTemplate,
    caseTypesForMilestoneType,
    hasTemplateGap,
    isCreatedAutomatically,
    milestoneTypesForContractType,
    subCaseTypesFor,
    taskTemplatesFor,
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

/** Zadanie startowe pokazywane w kaflu. Tyle, ile kafel potrafi narysować. */
export type LayoutTask = {
    id: number;
    name: string;
    status: string;
};

export type LayoutOptions = {
    /** Czy zadania startowe są rozwinięte w kaflach. Wyłączone - zostaje licznik. */
    showTasks?: boolean;
};

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
    /** Zadania do narysowania w kaflu; puste, gdy przełącznik „Zadania" jest wyłączony. */
    tasks?: LayoutTask[];
    /** Ile zadań ma typ - ustawione ZAWSZE, także przy schowanych, na licznik w kaflu. */
    taskCount?: number;
    x: number;
    y: number;
    w: number;
    h: number;
    /**
     * Wysokość, na której zaczepiają się linie, i względem której centruje się rodzic.
     *
     * To środek NAGŁÓWKA kafla, nie środek kafla. Kafel sprawy z listą zadań jest
     * wysoki, ale linia z kamienia ma trafiać w nazwę sprawy, a nie w połowę listy
     * zadań pod nią.
     */
    anchorY: number;
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
// Wiersz zadania i pasek nad listą (kreska + oddech). Rozwinięte zadania rosną
// wyłącznie w PIONIE - szerokość kolumn jest nietknięta, bo to ona decyduje,
// czy drzewo mieści się na laptopie.
const TASK_ROW_H = 20;
const TASK_BLOCK_PAD = 4;
const GAP_Y = 10;
const GROUP_GAP = 16;
const PAD = 20;

/**
 * Współrzędna `y` rodzica, przy której jego nagłówek stanie w połowie między
 * skrajnymi dziećmi. Liczone po punktach zaczepienia, więc lista zadań w kaflu
 * dziecka nie przeciąga rodzica w dół. Null dla zbioru pustego.
 */
function centerOf(nodes: LayoutNode[]): number | null {
    if (!nodes.length) return null;
    const top = Math.min(...nodes.map((node) => node.anchorY));
    const bottom = Math.max(...nodes.map((node) => node.anchorY));
    return (top + bottom) / 2 - NODE_H / 2;
}

/** Wysokość kafla typu sprawy: nagłówek plus rozwinięta lista zadań. */
export function caseNodeHeight(taskCount: number, showTasks: boolean): number {
    if (!showTasks || taskCount === 0) return NODE_H;
    return NODE_H + TASK_BLOCK_PAD + taskCount * TASK_ROW_H;
}

export function layout(
    data: TypesTreeData,
    selectedContractTypeId: number | null,
    options: LayoutOptions = {},
): Layout {
    const showTasks = options.showTasks ?? true;
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
        // Wysokość bierzemy z węzła, nie ze stałej: kafel sprawy rośnie o listę
        // zadań, a kolejny kafel ma zacząć się POD nim, nie 42 px niżej.
        const h = extra.h ?? NODE_H;
        const node: LayoutNode = {
            id: `${kind}:${entityId}`,
            kind,
            entityId,
            label,
            x: COL_X[column],
            y,
            w: NODE_W[column],
            h,
            anchorY: y + NODE_H / 2,
            ...extra,
        };
        nodes.push(node);
        nextFree[column] = y + h + GAP_Y;
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
    /** Zadania w kaflu - ta sama reguła dla obu ról typu sprawy, żeby żadna nie chowała ich po cichu. */
    function taskExtra(caseType: TypesTreeCaseType): Partial<LayoutNode> {
        const tasks = taskTemplatesFor(caseType);
        return {
            taskCount: tasks.length,
            tasks: showTasks ? tasks.map(toLayoutTask) : undefined,
            h: caseNodeHeight(tasks.length, showTasks),
        };
    }

    /** subCaseTypeId -> dane typu, potrzebne przy tworzeniu węzła w przebiegu 2. */
    const subCaseTypeById = new Map<number, ReturnType<typeof subCaseTypesFor>[number]>();

    for (const { milestoneType } of milestoneTypesForContractType(data, contractType.id)) {
        const caseNodes: LayoutNode[] = [];

        for (const caseType of caseTypesForMilestoneType(data, milestoneType.id)) {
            const caseNode = makeNode("caseType", 2, caseType.id, caseType.name, null, {
                badge: caseType.folderNumber ?? undefined,
                description: caseType.description,
                ...taskExtra(caseType),
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
            ...taskExtra(subCaseType),
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

function toLayoutTask(task: TypesTreeTaskTemplate): LayoutTask {
    return { id: task.id, name: task.name, status: task.status };
}
