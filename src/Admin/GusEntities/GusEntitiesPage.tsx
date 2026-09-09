import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, ProgressBar, Row, Spinner } from "react-bootstrap";
import { EntityData } from "../../../Typings/bussinesTypes";
import { GusStatusBadge } from "../../Entities/EntitiesBadges";
import { EntityEditModalButton } from "../../Entities/Modals/EntityModalButtons";
import {
    GusReport,
    GusReportEntity,
    GusSweepProgress,
    fetchGusReport,
    runGusSweepLoop,
} from "../../Entities/gusEntityService";

/**
 * GUS-4b — zakładka panelu administracyjnego „Podmioty w GUS".
 *
 * Nazwę zakładki zatwierdził właściciel 2026-09-09 („Podmioty w GUS", nie „Podmioty
 * a GUS" z brzmienia planu).
 *
 * Dwie rzeczy na jednym ekranie:
 *  1. przycisk przebiegu — woła POST entities/gus/sweep partia po partii, aż `remaining`
 *     spadnie do zera (pętla i jej zapora siedzą w gusEntityService.runGusSweepLoop);
 *  2. pięć list do sprzątania z GET entities/gus/report. Każda pozycja otwiera okno
 *     podmiotu; okno dociąga sobie pełny rekord z migawką (shouldRetrieveDataBeforeEdit).
 *
 * D-GUS-4: podmiot wykreślony z rejestru jest tu POKAZANY, a nie ukryty ani skasowany —
 * trzyma historię (faktury, umowy, pisma) i zostaje w słowniku nietknięty.
 */

type ListKey = "diff" | "duplicateNips" | "withoutNip" | "closed" | "diffMinor";

const LIST_TILES: { key: ListKey; title: string; note: string }[] = [
    { key: "diff", title: "Różni się co do rzeczy", note: "Do przejrzenia. Każda pozycja otwiera okno podmiotu." },
    {
        key: "duplicateNips",
        title: "Ten sam NIP w dwóch rekordach",
        note: "Zmiana nazwy spółki albo cudzy numer. Rozstrzygasz parami.",
    },
    { key: "withoutNip", title: "Bez NIP-u", note: "Poza zasięgiem rejestru, dopóki nie uzupełnisz numeru." },
    { key: "closed", title: "Wykreślone z rejestru", note: "Do wiadomości. Zostają w słowniku razem z historią." },
    { key: "diffMinor", title: "Inny zapis tej samej rzeczy", note: "Cicha lista. Nic nie wymaga reakcji." },
];

function countOf(report: GusReport | null, key: ListKey): number {
    if (!report) return 0;
    if (key === "duplicateNips") return report.duplicateNips.length;
    return report[key].length;
}

function EntityRow({ entity, onEdited }: { entity: GusReportEntity; onEdited: () => void }) {
    // Lista z zestawienia niesie tylko numer, nazwę, NIP i wynik porównania. Okno podmiotu
    // potrzebuje całego rekordu (migawka z rejestru!), więc dociąga go sobie samo.
    const initialData = { id: entity.id, name: entity.name ?? "", taxNumber: entity.taxNumber ?? "" } as EntityData;
    return (
        <div className="d-flex flex-wrap align-items-center gap-2 border-bottom py-2">
            <div className="flex-grow-1">
                <div>{entity.name || `Podmiot nr ${entity.id}`}</div>
                <div className="text-muted small">NIP: {entity.taxNumber || "brak"}</div>
            </div>
            <GusStatusBadge status={entity.gusStatus} checkedAt={entity.gusCheckedAt} />
            <EntityEditModalButton
                modalProps={{
                    onEdit: onEdited,
                    initialData,
                    shouldRetrieveDataBeforeEdit: true,
                }}
                buttonProps={{ buttonCaption: "Otwórz", buttonVariant: "outline-primary" }}
            />
        </div>
    );
}

export default function GusEntitiesPage({ title }: { title: string }) {
    const [report, setReport] = useState<GusReport | null>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedList, setSelectedList] = useState<ListKey>("diff");

    const [sweeping, setSweeping] = useState(false);
    const [progress, setProgress] = useState<GusSweepProgress | null>(null);
    const [sweepMessage, setSweepMessage] = useState<string | null>(null);
    /** Przerwany przebieg nie jest sukcesem i nie ma prawa świecić na zielono. */
    const [sweepAborted, setSweepAborted] = useState(false);

    useEffect(() => {
        document.title = title;
    }, [title]);

    const loadReport = useCallback(async () => {
        setReportLoading(true);
        setError(null);
        try {
            setReport(await fetchGusReport());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się pobrać zestawienia");
        } finally {
            setReportLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReport();
    }, [loadReport]);

    async function handleSweep() {
        setSweeping(true);
        setSweepMessage(null);
        setError(null);
        setProgress(null);
        try {
            const result = await runGusSweepLoop((current) => setProgress(current));
            setSweepAborted(result.aborted);
            setSweepMessage(
                result.aborted
                    ? `Przebieg przerwany: ${result.abortReason ?? "nieznany powód"}. Sprawdzono ${result.checked} podmiotów.`
                    : `Przebieg zakończony: sprawdzono ${result.checked} podmiotów w ${result.passes} partiach.`
            );
            await loadReport();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Błąd przebiegu");
        } finally {
            setSweeping(false);
        }
    }

    const percent = useMemo(() => {
        if (!progress || progress.total === 0) return 0;
        return Math.min(100, Math.round((progress.checked / progress.total) * 100));
    }, [progress]);

    const selectedTile = LIST_TILES.find((tile) => tile.key === selectedList)!;

    return (
        <Container fluid className="px-3">
            <h4 className="mb-1">Podmioty w GUS</h4>
            <p className="text-muted">
                Przebieg rusza sam pierwszego dnia miesiąca. Ten przycisk jest na wtedy, gdy nie chcesz czekać.
                Sprawdzenie zapisuje wyłącznie wynik porównania — nazwa i adres podmiotu zmieniają się dopiero
                po przyjęciu ich w oknie podmiotu.
            </p>

            <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                <Button variant="primary" onClick={handleSweep} disabled={sweeping}>
                    {sweeping ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Sprawdzanie...
                        </>
                    ) : (
                        "Sprawdź wszystkie w GUS"
                    )}
                </Button>
                {progress && (
                    <span className="text-muted small">
                        partia {progress.passes} &middot; sprawdzono {progress.checked} &middot; zostało{" "}
                        {progress.remaining} podmiotów
                    </span>
                )}
            </div>
            {progress && <ProgressBar now={percent} label={`${percent}%`} className="mb-3" />}

            {sweepMessage && (
                <Alert variant={sweepAborted ? "warning" : "success"} onClose={() => setSweepMessage(null)} dismissible>
                    {sweepMessage}
                </Alert>
            )}
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <Row className="g-3 mb-3">
                {LIST_TILES.map((tile) => (
                    <Col key={tile.key} xs={12} md={6} lg={4} xl={3}>
                        <Card
                            role="button"
                            onClick={() => setSelectedList(tile.key)}
                            border={selectedList === tile.key ? "primary" : undefined}
                            className="h-100"
                        >
                            <Card.Body>
                                <div className="fs-3 fw-bold">{countOf(report, tile.key)}</div>
                                <Card.Title as="h6">{tile.title}</Card.Title>
                                <Card.Text className="text-muted small">{tile.note}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card>
                <Card.Header>
                    <strong>{selectedTile.title}</strong>{" "}
                    <span className="text-muted small">{selectedTile.note}</span>
                </Card.Header>
                <Card.Body>
                    {reportLoading && <SpinnerLine />}
                    {!reportLoading && !report && <div className="text-muted">Brak zestawienia.</div>}
                    {!reportLoading && report && selectedList === "duplicateNips" && (
                        <DuplicatesList report={report} onEdited={loadReport} />
                    )}
                    {!reportLoading && report && selectedList !== "duplicateNips" && (
                        <PlainList entities={report[selectedList]} onEdited={loadReport} />
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

function SpinnerLine() {
    return (
        <div className="text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            Wczytywanie zestawienia...
        </div>
    );
}

function PlainList({ entities, onEdited }: { entities: GusReportEntity[]; onEdited: () => void }) {
    if (entities.length === 0) return <div className="text-muted">Pusto — nic tu nie czeka.</div>;
    return (
        <>
            {entities.map((entity) => (
                <EntityRow key={entity.id} entity={entity} onEdited={onEdited} />
            ))}
        </>
    );
}

function DuplicatesList({ report, onEdited }: { report: GusReport; onEdited: () => void }) {
    if (report.duplicateNips.length === 0) return <div className="text-muted">Pusto — nic tu nie czeka.</div>;
    return (
        <>
            {report.duplicateNips.map((group) => (
                <div key={group.nip} className="mb-3">
                    <div className="fw-bold">NIP {group.nip}</div>
                    {group.entities.map((entity) => (
                        <EntityRow key={entity.id} entity={entity} onEdited={onEdited} />
                    ))}
                </div>
            ))}
        </>
    );
}
