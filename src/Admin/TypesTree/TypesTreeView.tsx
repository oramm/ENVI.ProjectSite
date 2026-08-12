import React, { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, ListGroup, Row, Spinner } from "react-bootstrap";
import { addCaseType, addMilestoneType, editCaseType, editMilestoneType, fetchTypesTree } from "./typesTreeApi";
import { AddTypeKind, AddTypeModal, EditTarget } from "./AddTypeModal";
import {
    EMPTY_TREE,
    TypesTreeData,
    caseTypesWithoutMilestone,
    offerMilestoneTypes,
    unassignedMilestoneTypes,
} from "./typesTreeModel";
import { layout as buildLayout } from "./typesTreeLayout";
import { TypesTreeGraph } from "./TypesTreeGraph";

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

    const layout = useMemo(() => buildLayout(data, selectedContractTypeId), [data, selectedContractTypeId]);
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

    const selectedMilestoneTypeId =
        selectedNodeId && selectedNodeId.startsWith("milestoneType:")
            ? Number(selectedNodeId.split(":")[1])
            : null;

    return (
        // Container fluid, a nie zwykły div z paddingiem: Row ma ujemne marginesy
        // po 12 px z każdej strony i bez kompensacji wypycha stronę w poziomie.
        <Container fluid className="py-2">
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
                <div className="ms-auto d-flex gap-2">
                    <Button
                        size="sm"
                        variant="outline-success"
                        disabled={selectedContractTypeId === null}
                        onClick={() => {
                            setSaveError(null);
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
                            setAddKind("caseType");
                        }}
                    >
                        Dodaj typ sprawy
                    </Button>
                </div>
            </div>

            <Row>
                <Col md={3}>
                    <Card>
                        <Card.Header className="py-2">Typ umowy</Card.Header>
                        {/* Bez ograniczenia wysokości: lista typów umów jest krótka,
                            a drugi pasek przewijania obok wysokiego drzewa przeszkadza. */}
                        <ListGroup variant="flush">
                            {data.contractTypes.map((contractType) => (
                                <ListGroup.Item
                                    key={contractType.id}
                                    action
                                    active={contractType.id === selectedContractTypeId}
                                    onClick={() => {
                                        setSelectedContractTypeId(contractType.id);
                                        setSelectedNodeId(null);
                                    }}
                                    className="py-2"
                                >
                                    {contractType.name}{" "}
                                    {contractType.status === "OLD" && (
                                        <Badge bg="secondary" className="ms-1">
                                            wycofany
                                        </Badge>
                                    )}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={9}>
                    <Card>
                        <Card.Body className="p-2">
                            {/* Pierwszy klik zaznacza węzeł, drugi otwiera edycję -
                                dzięki temu da się przejrzeć gałąź bez otwierania okna. */}
                            <TypesTreeGraph
                                layout={layout}
                                selectedNodeId={selectedNodeId}
                                onNodeClick={(node) => {
                                    if (node.id === selectedNodeId) {
                                        if (node.kind !== "contractType") openEditFor(node.id);
                                        return;
                                    }
                                    setSelectedNodeId(node.id);
                                }}
                            />
                        </Card.Body>
                        <Card.Footer className="small text-muted d-flex flex-wrap gap-3">
                            <span>
                                <svg width="22" height="8">
                                    <line x1="0" y1="4" x2="22" y2="4" stroke="#198754" strokeWidth="2.5" />
                                </svg>{" "}
                                powstaje domyślnie przy nowej umowie
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
                            <span>ten sam typ może stać w obu kolumnach - to dwie jego role, nie duplikat</span>
                            <span>liczba na linii = numer folderu</span>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* Szuflady na węzły spoza wybranej gałęzi. Bez nich obraz wygląda
                na kompletny, a nim nie jest - i te typy nigdy nie zostaną zauważone.
                UWAGA: to NIE są elementy martwe - część z nich jest używana
                w istniejących kamieniach i sprawach mimo braku powiązania. */}
            <Row className="mt-3">
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
        </Container>
    );
}
