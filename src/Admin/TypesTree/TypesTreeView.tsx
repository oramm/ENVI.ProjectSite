import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Col,
    Container,
    Form,
    Row,
    Spinner,
    ToggleButton,
    ToggleButtonGroup,
} from "react-bootstrap";
import MainSetup from "../../React/MainSetupReact";
import { addCaseType, addMilestoneType, editCaseType, editMilestoneType, fetchTypesTree } from "./typesTreeApi";
import { AddTypeKind, AddTypeModal, EditTarget, TYPES_PANEL_WIDTH } from "./AddTypeModal";
import {
    EMPTY_TREE,
    TypesTreeData,
    caseTypesWithoutMilestone,
    offerMilestoneTypes,
    unassignedMilestoneTypes,
} from "./typesTreeModel";
import {
    LayoutNode,
    LayoutSummary,
    TreeDepth,
    layout as buildLayout,
    isExpandedByDepth,
    pluralPl,
} from "./typesTreeLayout";
import { TypesTreeGraph } from "./TypesTreeGraph";

/** Stan wyjściowy widoku: całe drzewo rozwinięte, zadania widoczne, zero wyjątków. */
const DEFAULT_DEPTH: TreeDepth = "subCases";

const DEPTH_LABELS: { value: TreeDepth; label: string }[] = [
    { value: "milestones", label: "kamienie" },
    { value: "cases", label: "sprawy" },
    { value: "subCases", label: "podsprawy" },
];

/** „3 z 25 spraw" albo „5 kamieni", gdy nic nie schowano. */
function countPhrase(
    visible: number,
    total: number,
    one: string,
    few: string,
    many: string,
): string {
    const noun = pluralPl(total, one, few, many);
    return visible === total ? `${total} ${noun}` : `${visible} z ${total} ${noun}`;
}

function summaryText(summary: LayoutSummary): string {
    const parts = [
        // Kolumna typów umów zajmuje jedną czwartą szerokości widoku - zdanie,
        // które ją przemilcza, opisuje inny obraz niż ten na ekranie.
        countPhrase(
            summary.contractTypes.visible,
            summary.contractTypes.total,
            "typ umowy",
            "typy umów",
            "typów umów",
        ),
        countPhrase(summary.milestoneTypes.visible, summary.milestoneTypes.total, "kamień", "kamienie", "kamieni"),
        countPhrase(summary.caseTypes.visible, summary.caseTypes.total, "sprawa", "sprawy", "spraw"),
        countPhrase(
            summary.subCaseTypes.visible,
            summary.subCaseTypes.total,
            "podsprawa",
            "podsprawy",
            "podspraw",
        ),
        countPhrase(summary.tasks.visible, summary.tasks.total, "zadanie", "zadania", "zadań"),
    ];
    return `widać: ${parts.join(" · ")}`;
}

/**
 * Podgląd hierarchii typów: umowa → kamień milowy → sprawa → podsprawa.
 *
 * Na razie tylko do odczytu. Edycja powiązań czeka na uporządkowanie zapisu
 * po stronie backendu - te powiązania sterują strukturą folderów zakładanych
 * na Dysku przy nowej umowie, więc zapis musi być pewny, zanim trafi do interfejsu.
 */
export default function TypesTreeView({ title }: { title: string }) {
    const [data, setData] = useState<TypesTreeData>(EMPTY_TREE);
    const [selectedContractTypeId, setSelectedContractTypeId] = useState<number | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [addKind, setAddKind] = useState<AddTypeKind | null>(null);
    const [editTarget, setEditTarget] = useState<EditTarget>(null);
    // Zadania startowe widoczne od razu - to one są powodem tej przebudowy.
    // Przełącznik istnieje po to, żeby dało się je schować, a nie żeby ich szukać.
    const [showTasks, setShowTasks] = useState(true);
    // Poziom ustawia STAN WYJŚCIOWY całego drzewa, chevron robi od niego wyjątek.
    const [depth, setDepth] = useState<TreeDepth>(DEFAULT_DEPTH);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    // Szuflady spoza gałęzi: informacja z pierwszego kontaktu z widokiem („co odbiega
    // od reszty"), nie codzienna - domyślnie zwinięte, żeby drzewo dostało miejsce.
    const [showExtras, setShowExtras] = useState(false);
    // Edycja tylko dla panelu administracyjnego. Reszta pracowników ENVI ogląda.
    // Ta sama granica stoi w backendzie (zapis pod /admin) - tutaj chodzi o to, żeby
    // widok nie proponował czegoś, co i tak skończy się odmową.
    const canEdit = MainSetup.isRoleAllowed(MainSetup.ADMIN_PANEL_ROLES);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    async function handleSave(kind: AddTypeKind, payload: any, editedId?: number) {
        setIsSaving(true);
        setSaveError(null);
        try {
            let tree;
            if (editedId !== undefined) {
                tree =
                    kind === "milestoneType"
                        ? await editMilestoneType(editedId, payload)
                        : await editCaseType(editedId, payload);
            } else {
                tree = kind === "milestoneType" ? await addMilestoneType(payload) : await addCaseType(payload);
            }
            setData(tree);
            setAddKind(null);
            setEditTarget(null);
        } catch (caught) {
            setSaveError(caught instanceof Error ? caught.message : "Nie udało się zapisać.");
        } finally {
            setIsSaving(false);
        }
    }

    /** Klik w prostokąt otwiera edycję typu kamienia albo typu sprawy. */
    function openEditFor(nodeId: string) {
        const [nodeKind, rawId] = nodeId.split(":");
        const id = Number(rawId);
        if (nodeKind === "milestoneType") {
            const entity = data.milestoneTypes.find((type) => type.id === id);
            if (entity) {
                setSaveError(null);
                setEditTarget({ kind: "milestoneType", entity });
            }
            return;
        }
        if (nodeKind === "caseType" || nodeKind === "subCaseType") {
            const entity = data.caseTypes.find((type) => type.id === id);
            if (entity) {
                setSaveError(null);
                setEditTarget({ kind: "caseType", entity });
            }
        }
    }

    useEffect(() => {
        document.title = title;
    }, [title]);

    useEffect(() => {
        let isActive = true;
        (async () => {
            try {
                const tree = await fetchTypesTree();
                if (!isActive) return;
                setData(tree);
                const firstActive =
                    tree.contractTypes.find((type) => type.status !== "OLD") ?? tree.contractTypes[0];
                setSelectedContractTypeId(firstActive ? firstActive.id : null);
            } catch (caught) {
                if (isActive) setError(caught instanceof Error ? caught.message : "Nieznany błąd.");
            } finally {
                if (isActive) setIsLoading(false);
            }
        })();
        return () => {
            isActive = false;
        };
    }, []);

    const layout = useMemo(
        () => buildLayout(data, selectedContractTypeId, { showTasks, depth, expanded }),
        [data, selectedContractTypeId, showTasks, depth, expanded],
    );

    /**
     * Chevron zapisuje wyjątek tylko wtedy, gdy faktycznie odbiega od poziomu.
     * Powrót do stanu zgodnego z poziomem kasuje wpis, więc „Zresetuj widok"
     * nie świeci się, kiedy nie ma czego resetować.
     */
    function toggleCollapse(node: LayoutNode) {
        const next = !node.isExpanded;
        setExpanded((current) => {
            const updated = { ...current };
            if (next === isExpandedByDepth(node.kind, depth)) delete updated[node.id];
            else updated[node.id] = next;
            return updated;
        });
    }

    /** Zmiana poziomu to nowy stan wyjściowy - wcześniejsze wyjątki przestają obowiązywać. */
    function changeDepth(next: TreeDepth) {
        setDepth(next);
        setExpanded({});
    }

    /**
     * Przełączenie typu umowy to inna gałąź, więc wyjątki chevronów nie mają się
     * do czego odnosić - kasujemy je razem z zaznaczeniem węzła. Poziom zostaje:
     * mówi, jak głęboko użytkownik chce patrzeć, a nie na co patrzy.
     */
    function selectContractType(contractTypeId: number) {
        if (contractTypeId === selectedContractTypeId) return;
        setSelectedContractTypeId(contractTypeId);
        setSelectedNodeId(null);
        setExpanded({});
        // Panel pokazywał typ z gałęzi, której już nie widać - zostawiony otwarty
        // opisywałby coś, czego nie ma na ekranie.
        setEditTarget(null);
    }

    function resetView() {
        setDepth(DEFAULT_DEPTH);
        setExpanded({});
        setShowTasks(true);
    }

    const isViewChanged = depth !== DEFAULT_DEPTH || Object.keys(expanded).length > 0 || !showTasks;
    const orphanMilestones = useMemo(() => unassignedMilestoneTypes(data), [data]);
    const orphanCaseTypes = useMemo(() => caseTypesWithoutMilestone(data), [data]);
    const offerBranch = useMemo(() => offerMilestoneTypes(data), [data]);

    if (isLoading)
        return (
            <div className="p-4 text-center">
                <Spinner animation="border" />
            </div>
        );

    if (error) return <Alert variant="danger">{error}</Alert>;

    const isPanelOpen = editTarget !== null;

    const selectedContractType = data.contractTypes.find((type) => type.id === selectedContractTypeId);

    const selectedMilestoneTypeId =
        selectedNodeId && selectedNodeId.startsWith("milestoneType:")
            ? Number(selectedNodeId.split(":")[1])
            : null;

    return (
        // Container fluid, a nie zwykły div z paddingiem: Row ma ujemne marginesy
        // po 12 px z każdej strony i bez kompensacji wypycha stronę w poziomie.
        // Otwarty panel ZWĘŻA obszar widoku o swoją szerokość, zamiast położyć się
        // na drzewie: kontener drzewa dostaje mniej miejsca, a płótno przelicza się
        // na nową szerokość, więc nic nie chowa się pod panelem.
        //
        // Zwężamy SZEROKOŚĆ, nie padding i nie margines: `container-fluid` ma
        // `width: 100%`, więc margines nic by nie ujął, a padding zjadłby te 12 px,
        // które kontener i tak trzyma po prawej (obszar spadłby o 340, nie o 352 px).
        // Marginesy zerujemy ręcznie, bo `container-fluid` ma je na `auto` i sam
        // zwężony kontener WYŚRODKOWAŁBY się - prawą krawędzią wjeżdżając pod panel.
        <Container
            fluid
            className="py-2"
            style={
                isPanelOpen
                    ? { width: `calc(100% - ${TYPES_PANEL_WIDTH}px)`, marginLeft: 0, marginRight: TYPES_PANEL_WIDTH }
                    : undefined
            }
        >
            <AddTypeModal
                kind={addKind}
                editTarget={editTarget}
                data={data}
                contractTypeId={selectedContractTypeId}
                defaultMilestoneTypeId={selectedMilestoneTypeId}
                isSaving={isSaving}
                error={saveError}
                onClose={() => {
                    setAddKind(null);
                    setEditTarget(null);
                }}
                onSubmit={handleSave}
            />
            <div className="d-flex align-items-center gap-2 flex-wrap">
                <h4 className="mb-0">{title}</h4>
                {!canEdit && (
                    <span className="small text-muted" data-testid="types-tree-readonly">
                        Podgląd - zmiany wprowadza się w panelu administracyjnym.
                    </span>
                )}
                <div className="ms-auto d-flex gap-2">
                    {canEdit && (
                    <>
                    <Button
                        size="sm"
                        variant="outline-success"
                        disabled={selectedContractTypeId === null}
                        onClick={() => {
                            setSaveError(null);
                            // Dodawanie zostaje oknem modalnym (decyzja 4 planu), a okno
                            // i panel to dwie powłoki tego samego formularza - otwarty
                            // panel przesłoniłby okno i przycisk wyglądałby na martwy.
                            setEditTarget(null);
                            setAddKind("milestoneType");
                        }}
                    >
                        Dodaj kamień milowy
                    </Button>
                    <Button
                        size="sm"
                        variant="outline-success"
                        disabled={selectedContractTypeId === null}
                        onClick={() => {
                            setSaveError(null);
                            setEditTarget(null);
                            setAddKind("caseType");
                        }}
                    >
                        Dodaj typ sprawy
                    </Button>
                    </>
                    )}
                </div>
            </div>

            {/* Lista typów umów przeniosła się do kolumny zerowej drzewa (decyzja A4),
                więc karta drzewa bierze całą szerokość. Row i Col zostają, żeby drzewo
                stało w tej samej pionowej linii co karty w dolnym rzędzie. */}
            <Row>
                <Col md={12}>
                    <Card>
                        {/* Pasek narzędzi nad drzewem: głębokość, zadania, reset
                            i zdanie mówiące, ile z czego widać. */}
                        <Card.Header className="py-2 d-flex align-items-center gap-3 flex-wrap">
                            <span className="small text-muted">Pokaż do:</span>
                            <ToggleButtonGroup
                                type="radio"
                                name="types-tree-depth"
                                size="sm"
                                value={depth}
                                onChange={changeDepth}
                            >
                                {DEPTH_LABELS.map(({ value, label }) => (
                                    <ToggleButton
                                        key={value}
                                        id={`types-tree-depth-${value}`}
                                        data-testid="types-tree-depth"
                                        data-depth={value}
                                        value={value}
                                        variant="outline-secondary"
                                    >
                                        {label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                            <Form.Check
                                type="switch"
                                id="types-tree-show-tasks"
                                data-testid="types-tree-tasks-toggle"
                                className="mb-0"
                                label="Zadania"
                                checked={showTasks}
                                onChange={(event) => setShowTasks(event.currentTarget.checked)}
                            />
                            {/* Przycisk pojawia się dopiero, gdy jest co cofać -
                                martwy przycisk uczy, że nic się po nim nie dzieje. */}
                            {isViewChanged && (
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="p-0 small"
                                    data-testid="types-tree-reset"
                                    onClick={resetView}
                                >
                                    Zresetuj widok
                                </Button>
                            )}
                            <span data-testid="types-tree-summary" className="small text-muted">
                                {summaryText(layout.summary)}
                            </span>
                            {/* Rekompensata za E2: samo przekreślenie nie mówi, DLACZEGO
                                nazwa jest przekreślona. Czerwień, bo jedyny wolny kolor
                                o wystarczającym kontraście - zieleń, pomarańcz, fiolet
                                i szarość mają w tym widoku swoje znaczenia. */}
                            {selectedContractType?.status === "OLD" && (
                                <span data-testid="types-tree-retired" className="small text-danger">
                                    Ten typ umowy jest wycofany.
                                </span>
                            )}
                            {!showTasks && layout.summary.tasks.total > 0 && (
                                <span className="small text-muted">Licznik zadań zostaje na kaflu.</span>
                            )}
                        </Card.Header>
                        <Card.Body className="p-2" style={{ position: "relative" }}>
                            {/* Legenda w rogu drzewa, nie paskiem pod nim: pasek zabierał
                                pełną szerokość karty i wysokość, której potrzebuje drzewo.
                                Zwinięta do jednego słowa, bo rozwinięta zasłania kafle podspraw
                                na 1366 px (zmierzone: subCaseType 109, 110, 111). Zwijaniem
                                zajmuje się <details> - własny stan nie dałby tu nic więcej. */}
                            <details
                                data-testid="types-tree-legend"
                                className="small text-muted"
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    zIndex: 2,
                                    maxWidth: 260,
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    border: "1px solid #e9ecef",
                                    background: "rgba(255, 255, 255, 0.92)",
                                }}
                            >
                                <summary style={{ cursor: "pointer" }}>Legenda</summary>
                                <div
                                    data-testid="types-tree-legend-items"
                                    style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}
                                >
                                <span>
                                    <svg width="22" height="8">
                                        <line x1="0" y1="4" x2="22" y2="4" stroke="#198754" strokeWidth="2.5" />
                                    </svg>{" "}
                                    powstaje samo przy nowej umowie
                                </span>
                                <span>
                                    <svg width="22" height="8">
                                        <line
                                            x1="0"
                                            y1="4"
                                            x2="22"
                                            y2="4"
                                            stroke="#fd7e14"
                                            strokeWidth="2.5"
                                            strokeDasharray="6 4"
                                        />
                                    </svg>{" "}
                                    oznaczone jako domyślne, ale bez szablonu - nie powstanie
                                </span>
                                <span>
                                    <svg width="22" height="8">
                                        <line x1="0" y1="4" x2="22" y2="4" stroke="#ced4da" strokeWidth="1.5" />
                                    </svg>{" "}
                                    zwykłe
                                </span>
                                <span>
                                    <svg width="16" height="12">
                                        <rect
                                            x="1"
                                            y="1"
                                            width="14"
                                            height="10"
                                            rx="2"
                                            fill="#fff"
                                            stroke="#adb5bd"
                                            strokeDasharray="4 2"
                                        />
                                    </svg>{" "}
                                    wyłącznie jako podsprawa
                                </span>
                                <span>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            width: 7,
                                            height: 7,
                                            borderRadius: 4,
                                            background: "#6f42c1",
                                        }}
                                    />{" "}
                                    zadanie startowe - powstaje razem ze sprawą
                                </span>
                                </div>
                            </details>
                            {/* Pierwszy klik zaznacza węzeł, drugi otwiera edycję -
                                dzięki temu da się przejrzeć gałąź bez otwierania okna. */}
                            <TypesTreeGraph
                                layout={layout}
                                selectedNodeId={selectedNodeId}
                                onNodeClick={(node) => {
                                    // Kolumna zerowa przejęła rolę listy po lewej:
                                    // klik w typ umowy przełącza gałąź, a nie zaznacza węzeł.
                                    if (node.kind === "contractType") {
                                        selectContractType(node.entityId);
                                        return;
                                    }
                                    // Przy otwartym panelu klik w sąsiedni kafel PODMIENIA
                                    // jego zawartość - panel nie zamyka się i nie otwiera
                                    // od nowa. Dopóki panel jest zamknięty, zostaje wejście
                                    // dwuklikiem: pierwszy klik zaznacza, drugi otwiera.
                                    setSelectedNodeId(node.id);
                                    if (!canEdit) return;
                                    if (isPanelOpen || node.id === selectedNodeId) openEditFor(node.id);
                                }}
                                onToggleCollapse={toggleCollapse}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Szuflady na węzły spoza wybranej gałęzi. Bez nich obraz wygląda
                na kompletny, a nim nie jest - i te typy nigdy nie zostaną zauważone.
                UWAGA: to NIE są elementy martwe - część z nich jest używana
                w istniejących kamieniach i sprawach mimo braku powiązania.
                Zwinięte domyślnie, ale LICZBA STOI W PRZYCISKU - zwinięcie nie chowa
                niczego po cichu, tak samo jak zwinięcie gałęzi w drzewie. */}
            <Button
                variant="link"
                size="sm"
                className="px-0 mt-3"
                aria-expanded={showExtras}
                data-testid="types-tree-extras-toggle"
                onClick={() => setShowExtras((current) => !current)}
            >
                {showExtras ? "Ukryj" : "Pokaż"} typy spoza wybranej gałęzi (
                {offerBranch.length + orphanMilestones.length + orphanCaseTypes.length})
            </Button>
            {showExtras && (
            <Row className="mt-1">
                <Col md={4}>
                    <Card>
                        <Card.Header className="py-2 small">Kamienie ofertowe ({offerBranch.length})</Card.Header>
                        <Card.Body className="py-2 small">
                            {offerBranch.length === 0 ? (
                                <span className="text-muted">Brak.</span>
                            ) : (
                                offerBranch.map(({ edge, milestoneType }) => (
                                    <div key={milestoneType.id}>
                                        <code>{edge.folderNumber}</code> {milestoneType.name}
                                    </div>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Header className="py-2 small">
                            Kamienie bez powiązania z typem umowy ({orphanMilestones.length})
                        </Card.Header>
                        <Card.Body className="py-2 small">
                            {orphanMilestones.length === 0 ? (
                                <span className="text-muted">Brak.</span>
                            ) : (
                                orphanMilestones.map((type) => <div key={type.id}>{type.name}</div>)
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Header className="py-2 small">
                            Typy spraw bez kamienia ({orphanCaseTypes.length})
                        </Card.Header>
                        <Card.Body className="py-2 small">
                            {orphanCaseTypes.length === 0 ? (
                                <span className="text-muted">Brak.</span>
                            ) : (
                                orphanCaseTypes.map((caseType) => <div key={caseType.id}>{caseType.name}</div>)
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            )}
        </Container>
    );
}
