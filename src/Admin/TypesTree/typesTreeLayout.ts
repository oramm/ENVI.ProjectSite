import {
    TypesTreeData,
    TypesTreeCaseType,
    TypesTreeContractTypeMilestoneType,
    TypesTreeMilestoneType,
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
 *
 * ZWIJANIE nie wycina węzłów z gotowego układu - decyduje o tym, czy węzeł w ogóle
 * powstanie. Odejmowanie wysokości po fakcie byłoby błędne, bo kafel sprawy ma
 * wysokość zmienną (lista zadań), a wyśrodkowanie rodzica liczy się z tego, co
 * faktycznie zostało narysowane.
 */

export type NodeKind = "contractType" | "milestoneType" | "caseType" | "subCaseType";

/**
 * Do której kolumny drzewo jest rozwinięte w stanie wyjściowym.
 *
 * To głębokość KOLUMN, nie „wszystkiego, co wisi pod sprawą". Zadania startowe stoją
 * wewnątrz kafla sprawy, a nie w osobnej kolumnie, więc segment ich nie dotyczy -
 * mają własny przełącznik (decyzja C3 packa HTY).
 */
export type TreeDepth = "milestones" | "cases" | "subCases";

const DEPTH_RANK: Record<TreeDepth, number> = { milestones: 1, cases: 2, subCases: 3 };

/** Zadanie startowe pokazywane w kaflu. Tyle, ile kafel potrafi narysować. */
export type LayoutTask = {
    id: number;
    name: string;
    status: string;
};

export type LayoutOptions = {
    /** Czy zadania startowe są rozwinięte w kaflach. Wyłączone - zostaje licznik. */
    showTasks?: boolean;
    /** Stan wyjściowy zwinięcia: do której kolumny drzewo jest rozwinięte. */
    depth?: TreeDepth;
    /**
     * Lokalne wyjątki od głębokości: id węzła -> czy jego dzieci są widoczne.
     *
     * Wyjątek działa w OBIE strony. Chevron zwija gałąź, którą głębokość pokazuje,
     * ale też rozwija gałąź, którą głębokość chowa - inaczej „rozwiń jedną gałąź
     * do dna" wymagałoby najpierw rozwinięcia całego drzewa.
     */
    expanded?: Record<string, boolean>;
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
    /** Kafel ma dzieci w następnej kolumnie, więc dostaje chevron. */
    canCollapse?: boolean;
    /** Stan chevronu. Bez znaczenia, gdy `canCollapse` jest fałszywe. */
    isExpanded?: boolean;
    /**
     * Ile dzieci kafel chowa. Ustawione ZAWSZE, gdy coś chowa - bez względu na to,
     * czy schował je chevron, czy globalna głębokość. Zwinięcie bez licznika
     * ukrywałoby część drzewa po cichu.
     */
    hiddenCount?: number;
    /** Licznik rozwinięty do zdania - trafia do podpowiedzi kafla. */
    hiddenLabel?: string;
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

/** Ile z czego widać przy ilu istniejących - do zdania podsumowującego nad drzewem. */
export type VisibleTotal = { visible: number; total: number };

export type LayoutSummary = {
    milestoneTypes: VisibleTotal;
    caseTypes: VisibleTotal;
    subCaseTypes: VisibleTotal;
    tasks: VisibleTotal;
};

export type Layout = {
    nodes: LayoutNode[];
    edges: LayoutEdge[];
    width: number;
    height: number;
    summary: LayoutSummary;
};

const NOTHING: VisibleTotal = { visible: 0, total: 0 };

export const EMPTY_SUMMARY: LayoutSummary = {
    milestoneTypes: NOTHING,
    caseTypes: NOTHING,
    subCaseTypes: NOTHING,
    tasks: NOTHING,
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

/**
 * Czy dzieci węzła są widoczne przy danej głębokości, bez wyjątków lokalnych.
 *
 * Potrzebne widokowi: chevron przywrócony do stanu zgodnego z poziomem przestaje
 * być wyjątkiem i ma zniknąć z listy wyjątków, inaczej „Zresetuj widok" świeciłby
 * się mimo braku czegokolwiek do zresetowania.
 */
export function isExpandedByDepth(kind: NodeKind, depth: TreeDepth): boolean {
    if (kind === "milestoneType") return DEPTH_RANK[depth] >= 2;
    if (kind === "caseType") return DEPTH_RANK[depth] >= 3;
    return false;
}

/** Polska odmiana po liczbie - liczniki i podsumowanie mówią zdaniem, nie skrótem. */
export function pluralPl(count: number, one: string, few: string, many: string): string {
    if (count === 1) return one;
    const lastDigit = count % 10;
    const lastTwo = count % 100;
    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
    return many;
}

/** Gałąź jednego kamienia, policzona z danych - niezależnie od tego, co widać. */
type Branch = {
    edge: TypesTreeContractTypeMilestoneType;
    milestoneType: TypesTreeMilestoneType;
    cases: { caseType: TypesTreeCaseType; subCaseTypes: TypesTreeCaseType[] }[];
};

export function layout(
    data: TypesTreeData,
    selectedContractTypeId: number | null,
    options: LayoutOptions = {},
): Layout {
    const showTasks = options.showTasks ?? true;
    const depthRank = DEPTH_RANK[options.depth ?? "subCases"];
    const overrides = options.expanded ?? {};
    const contractType = data.contractTypes.find((type) => type.id === selectedContractTypeId);
    if (!contractType) return { nodes: [], edges: [], width: 0, height: 0, summary: EMPTY_SUMMARY };

    /**
     * Pełna gałąź policzona z danych, ZANIM cokolwiek zostanie ukryte.
     *
     * Liczniki ukrytych dzieci i podsumowanie muszą znać stan pełny - inaczej
     * zwinięcie chowałoby także dowód na to, że coś schowano.
     */
    const branches: Branch[] = milestoneTypesForContractType(data, contractType.id).map(
        ({ edge, milestoneType }) => ({
            edge,
            milestoneType,
            cases: caseTypesForMilestoneType(data, milestoneType.id).map((caseType) => ({
                caseType,
                subCaseTypes: subCaseTypesFor(data, caseType.id),
            })),
        }),
    );

    /** Wyjątek lokalny bije głębokość; bez wyjątku decyduje ona. */
    const isExpanded = (nodeId: string, rankNeeded: number) => overrides[nodeId] ?? depthRank >= rankNeeded;

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

    /** Zadania w kaflu - ta sama reguła dla obu ról typu sprawy, żeby żadna nie chowała ich po cichu. */
    function taskExtra(caseType: TypesTreeCaseType): Partial<LayoutNode> {
        const tasks = taskTemplatesFor(caseType);
        return {
            taskCount: tasks.length,
            tasks: showTasks ? tasks.map(toLayoutTask) : undefined,
            h: caseNodeHeight(tasks.length, showTasks),
        };
    }

    /** Licznik ukrytych dzieci wraz ze zdaniem do podpowiedzi. Pusty, gdy nic nie ukryto. */
    function hiddenExtra(count: number, one: string, few: string, many: string): Partial<LayoutNode> {
        if (count <= 0) return {};
        return { hiddenCount: count, hiddenLabel: `Ukryte: ${count} ${pluralPl(count, one, few, many)}` };
    }

    /* ---------- przebieg 1: kamienie i sprawy ---------- */

    const milestoneNodes: LayoutNode[] = [];
    /** Identyfikatory węzłów spraw zakładanych automatycznie razem z kamieniem. */
    const defaultCaseNodeIds = new Set<string>();
    /** Węzły oznaczone jako domyślne, ale bez szablonu - nie powstaną. */
    const gapNodeIds = new Set<string>();
    /** subCaseTypeId -> WIDOCZNE węzły spraw, pod którymi jest dopuszczony. */
    const parentsOfSubCase = new Map<number, LayoutNode[]>();
    /** subCaseTypeId -> dane typu, potrzebne przy tworzeniu węzła w przebiegu 2. */
    const subCaseTypeById = new Map<number, TypesTreeCaseType>();

    for (const branch of branches) {
        const milestoneNodeId = `milestoneType:${branch.milestoneType.id}`;
        const casesVisible = isExpanded(milestoneNodeId, 2);
        const caseNodes: LayoutNode[] = [];

        if (casesVisible) {
            for (const { caseType, subCaseTypes } of branch.cases) {
                const caseNodeId = `caseType:${caseType.id}`;
                const subCasesVisible = isExpanded(caseNodeId, 3);
                const caseNode = makeNode("caseType", 2, caseType.id, caseType.name, null, {
                    badge: caseType.folderNumber ?? undefined,
                    description: caseType.description,
                    ...taskExtra(caseType),
                    canCollapse: subCaseTypes.length > 0,
                    isExpanded: subCasesVisible,
                    ...hiddenExtra(
                        subCasesVisible ? 0 : subCaseTypes.length,
                        "typ podsprawy",
                        "typy podspraw",
                        "typów podspraw",
                    ),
                });
                caseNodes.push(caseNode);
                // Flagę „domyślny” typu sprawy niesie krawędź z kamienia - tak samo jak
                // przy kamieniach. Dzięki temu jednym rzutem oka widać, które sprawy
                // powstają automatycznie przy zakładaniu umowy.
                if (isCreatedAutomatically(caseType)) defaultCaseNodeIds.add(caseNode.id);
                if (hasTemplateGap(caseType)) gapNodeIds.add(caseNode.id);

                if (!subCasesVisible) continue;
                for (const subCaseType of subCaseTypes) {
                    subCaseTypeById.set(subCaseType.id, subCaseType);
                    const parents = parentsOfSubCase.get(subCaseType.id) ?? [];
                    parents.push(caseNode);
                    parentsOfSubCase.set(subCaseType.id, parents);
                }
            }

            // Odstęp między gałęziami, żeby sprawy jednego kamienia nie zlewały się
            // wizualnie ze sprawami następnego. Tylko gdy gałąź coś narysowała -
            // pusta gałąź nie ma prawa spychać następnej w dół.
            if (caseNodes.length) nextFree[2] += GROUP_GAP;
        }

        const milestoneNode = makeNode(
            "milestoneType",
            1,
            branch.milestoneType.id,
            branch.milestoneType.name,
            centerOf(caseNodes),
            {
                description: branch.milestoneType.description,
                hasTemplate: branch.milestoneType._templateId !== null,
                canCollapse: branch.cases.length > 0,
                isExpanded: casesVisible,
                ...hiddenExtra(
                    casesVisible ? 0 : branch.cases.length,
                    "typ sprawy",
                    "typy spraw",
                    "typów spraw",
                ),
            },
        );
        milestoneNodes.push(milestoneNode);
        caseNodes.forEach((caseNode) =>
            edges.push({
                fromId: milestoneNode.id,
                toId: caseNode.id,
                isDefault: defaultCaseNodeIds.has(caseNode.id),
                hasGap: gapNodeIds.has(caseNode.id),
            }),
        );
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
        //
        // Podsprawa dzielona między rodzicami zostaje na ekranie, dopóki choć jeden
        // rodzic jest rozwinięty. Zwinięci rodzice policzyli ją już u siebie.
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
    // Przy zwiniętym drzewie działa to tak samo: nieużyta kolumna nie zajmuje miejsca.
    const width = Math.max(...nodes.map((node) => node.x + node.w)) + PAD;
    const height = Math.max(...nodes.map((node) => node.y + node.h)) + PAD;
    return { nodes, edges, width, height, summary: summarize(branches, nodes) };
}

/**
 * Ile z czego widać i ile jest w całej gałęzi wybranego typu umowy.
 *
 * Zadania liczone po KAFLACH, nie po typach: ten sam typ stojący w dwóch rolach ma
 * dwa kafle i pokazuje swoje zadania w obu, więc licząc po typach zdanie nad drzewem
 * rozjeżdżałoby się z tym, co widać na ekranie.
 */
function summarize(branches: Branch[], nodes: LayoutNode[]): LayoutSummary {
    const allCases = branches.flatMap((branch) => branch.cases);
    const allSubCaseTypes = new Map<number, TypesTreeCaseType>();
    allCases.forEach(({ subCaseTypes }) =>
        subCaseTypes.forEach((subCaseType) => allSubCaseTypes.set(subCaseType.id, subCaseType)),
    );

    const visibleOf = (kind: NodeKind) => nodes.filter((node) => node.kind === kind).length;
    const taskCountOf = (caseType: TypesTreeCaseType) => taskTemplatesFor(caseType).length;

    return {
        milestoneTypes: { visible: visibleOf("milestoneType"), total: branches.length },
        caseTypes: { visible: visibleOf("caseType"), total: allCases.length },
        subCaseTypes: { visible: visibleOf("subCaseType"), total: allSubCaseTypes.size },
        tasks: {
            visible: nodes.reduce((sum, node) => sum + (node.tasks?.length ?? 0), 0),
            total:
                allCases.reduce((sum, { caseType }) => sum + taskCountOf(caseType), 0) +
                Array.from(allSubCaseTypes.values()).reduce(
                    (sum, subCaseType) => sum + taskCountOf(subCaseType),
                    0,
                ),
        },
    };
}

function toLayoutTask(task: TypesTreeTaskTemplate): LayoutTask {
    return { id: task.id, name: task.name, status: task.status };
}
