import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Modal, Row, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { EntityData, OtherContract, OurContract, ProjectData } from "../../../../Typings/bussinesTypes";
import MainSetup from "../../../React/MainSetupReact";
import ToolsDate from "../../../React/Tools/ToolsDate";
import { FormProvider } from "../../../View/Modals/FormContext";
import { PartialEditTrigger } from "../../../View/Modals/GeneralModalButtons";
import { ContractStatusBadge, FidmanSyncBadge, GDFolderIconLink } from "../../../View/Resultsets/CommonComponents";
import {
    FidmanSyncStatus,
    fetchFidmanSyncStatus,
    retryFidmanSync,
} from "../Modals/fidmanSyncService";
import { ProjectSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import {
    ContractModalBodyDates,
    ContractModalBodyName,
    ContractModalBodyStatus,
} from "../Modals/ContractModalBodiesPartial";
import {
    contractDatesValidationSchema,
    contractNameValidationSchema,
    contractStatusValidationSchema,
} from "../Modals/ContractValidationSchema";
import { ContractDocumentBadge } from "../ContractRowContent";
import { useContractDetails } from "./ContractDetailsContext";

export function ContractMainHeader() {
    const { contract, setContract, contractsRepository } = useContractDetails();
    if (!contract || !setContract) return <Alert variant="danger">Nie wybrano umowy</Alert>;
    if (!contractsRepository) return <Alert variant="danger">Nie znaleziono repozytorium</Alert>;
    // Brakująca data NIE zasłania już karty. Wcześniejsze trzy strażniki zwracały sam alert
    // zamiast całej góry umowy, przez co braku nie dało się nawet naprawić — modal edycji dat
    // otwiera się właśnie stąd. Nie były zresztą regułą domenową, tylko dopasowaniem do typu
    // `date: string` w DateEditTrigger; ten od zawsze umiał wyrenderować pusty termin.
    // Brak pokazujemy teraz w miejscu danej daty (decyzja właściciela 2026-08-11).

    function renderEntityDetails() {
        if (!contract) return <></>;
        if ("ourId" in contract) {
            return (
                <>
                    <div>Zamawiający</div>
                    <h5>{renderEntityData(contract._employers || [])}</h5>
                </>
            );
        } else
            return (
                <>
                    <div>Wykonawca</div>
                    <h5>{renderEntityData(contract._contractors || [])}</h5>
                </>
            );
    }

    function renderEntityData(entities: EntityData[]) {
        return entities.map((entity) => {
            return (
                <div key={entity.id}>
                    <div>{entity.name}</div>
                    <div>{entity.address}</div>
                    <div>{entity.taxNumber}</div>
                </div>
            );
        });
    }

    function handleEditObject(contract: OurContract | OtherContract) {
        if (setContract) setContract(contract);
        const newItems = contractsRepository?.items.map((o) => (o.id === contract.id ? contract : o)) || [];
        if (contractsRepository) contractsRepository.items = newItems;
    }

    return (
        <Container>
            <Row className="mt-3">
                <Col sm={11} md={6}>
                    {renderEntityDetails()}
                </Col>
                {"ourId" in contract && (
                    <Col sm={4} md={2}>
                        <div>Oznaczenie:</div>
                        <h5>{contract.ourId}</h5>
                    </Col>
                )}
                <Col sm={4} md={2}>
                    <div>Nr umowy:</div>
                    <h5>{contract.number}</h5>
                </Col>
                <Col sm={1}>
                    <PartialEditTrigger
                        modalProps={{
                            initialData: contract,
                            modalTitle: "Edycja statusu",
                            repository: contractsRepository,
                            ModalBodyComponent: ContractModalBodyStatus,
                            onEdit: handleEditObject,
                            fieldsToUpdate: ["status"],
                            makeValidationSchema: contractStatusValidationSchema,
                        }}
                    >
                        <ContractStatusBadge status={contract?.status} />
                    </PartialEditTrigger>
                </Col>
                <Col sm={1}>{contract._gdFolderUrl && <GDFolderIconLink folderUrl={contract._gdFolderUrl} />}</Col>
                <Col sm={12} md={6} className="d-flex align-items-center">
                    <MoveContractButton />
                </Col>
                <Col sm={12} md={6} className="d-flex align-items-center gap-2">
                    <FidmanSyncSection />
                    <ContractDocumentSection />
                </Col>
                <Col sm={12} md={6}>
                    <PartialEditTrigger
                        modalProps={{
                            initialData: contract,
                            modalTitle: "Edycja nazwy",
                            repository: contractsRepository,
                            ModalBodyComponent: ContractModalBodyName,
                            onEdit: (contract) => {
                                setContract(contract);
                            },
                            fieldsToUpdate: ["name"],
                            makeValidationSchema: contractNameValidationSchema,
                        }}
                    >
                        <>
                            <div>Nazwa:</div>
                            <h5>{contract?.name}</h5>
                        </>
                    </PartialEditTrigger>
                </Col>
                <Col sm={4} md={2}>
                    <div>Data podpisania:</div>
                    <DateEditTrigger date={contract.startDate} isRequired />
                </Col>
                <Col sm={4} md={2}>
                    <div>Termin zakończenia:</div>
                    <DateEditTrigger date={contract.endDate} isRequired />
                </Col>
                <Col sm={4} md={2}>
                    <div>Gwarancja:</div>
                    <DateEditTrigger date={contract.guaranteeEndDate} />
                </Col>
                {/* Terminy nieobowiązkowe pokazujemy tylko wtedy, gdy są wpisane — inaczej
                    nagłówek każdej starszej umowy puchłby o dwa „Jeszcze nie ustalono".
                    Wpisać je można z dowolnego terminu obok: modal edycji dat jest wspólny. */}
                {contract.warrantyEndDate && (
                    <Col sm={4} md={2}>
                        <div>Rękojmia:</div>
                        <DateEditTrigger date={contract.warrantyEndDate} />
                    </Col>
                )}
                {contract.defectsNotificationEndDate && (
                    <Col sm={4} md={2}>
                        <div>Zgłaszanie wad do:</div>
                        <DateEditTrigger date={contract.defectsNotificationEndDate} />
                    </Col>
                )}
            </Row>
        </Container>
    );
}

function MoveContractButton() {
    const { contract, setContract, contractsRepository } = useContractDetails();
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const methods = useForm();
    const newProject = methods.watch("_newProject") as ProjectData | undefined;

    if (!contract || !("ourId" in contract) || !setContract) return null;

    async function handleMove() {
        if (!newProject?.ourId || !setContract) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${MainSetup.serverUrl}contract/${contract!.id}/move`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newProjectOurId: newProject.ourId }),
                    credentials: "include",
                }
            );
            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || `Błąd serwera: ${response.status}`);
            }
            const updated: OurContract = await response.json();
            setContract(updated);
            if (contractsRepository) {
                contractsRepository.items = contractsRepository.items.map((o) =>
                    o.id === updated.id ? updated : o
                );
            }
            setShow(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                    methods.reset({ _newProject: undefined });
                    setError(null);
                    setShow(true);
                }}
            >
                Przenieś kontrakt
            </Button>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Przenieś kontrakt do innego projektu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormProvider value={methods}>
                        <ProjectSelector name="_newProject" showValidationInfo={false} />
                    </FormProvider>
                    {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Anuluj
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleMove}
                        disabled={!newProject?.ourId || isLoading}
                    >
                        {isLoading ? <Spinner size="sm" animation="border" /> : "Przenieś"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

/**
 * SYNC-P2 — "synchronizacja do dopchnięcia" badge + manual retry for the
 * PS ENVI -> FIDman outbox (see ../Modals/fidmanSyncService.ts). Renders
 * nothing while status is "NONE" (contract type not synced, or not enqueued
 * yet) — the backend decides gating, the front just reflects it.
 */
function FidmanSyncSection() {
    const { contract } = useContractDetails();
    const [status, setStatus] = useState<FidmanSyncStatus | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setStatus(null); // clear the previous contract's badge so it can't flash before the new fetch
        if (!contract?.id) return;
        let cancelled = false;
        fetchFidmanSyncStatus(contract.id)
            .then((s) => {
                if (!cancelled) setStatus(s);
            })
            .catch(() => {
                // ponytail: silent — a missing/failed status read must not block the header.
            });
        return () => {
            cancelled = true;
        };
    }, [contract?.id]);

    if (!contract?.id || !status || status.status === "NONE") return null;

    async function handleRetry() {
        if (!contract?.id) return;
        setIsRetrying(true);
        setError(null);
        try {
            setStatus(await retryFidmanSync(contract.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsRetrying(false);
        }
    }

    const canRetry = status.status === "FAILED" || status.status === "SKIPPED";

    return (
        <>
            <FidmanSyncBadge status={status.status} tooltip={status.skipReasonLabel || status.lastError} />
            {canRetry && (
                <Button variant="outline-secondary" size="sm" onClick={handleRetry} disabled={isRetrying}>
                    {isRetrying ? <Spinner size="sm" animation="border" /> : "Dopchnij synchronizację"}
                </Button>
            )}
            {error && (
                <Alert variant="danger" className="mb-0 py-1 px-2">
                    {error}
                </Alert>
            )}
        </>
    );
}

/**
 * Wynik cyklicznej kontroli „czy wgrano umowę na Dysk". Ta sama plakietka co na liście —
 * jeden wygląd tego stanu w całej aplikacji.
 *
 * W karcie dokładamy DATĘ sprawdzenia, i to nie jest ozdobnik: bez niej użytkownik, który
 * właśnie wgrał umowę, widzi ostrzeżenie i nie ma jak się dowiedzieć, że pochodzi ono
 * z nocnego przebiegu, a nie z bieżącego stanu folderu.
 */
function ContractDocumentSection() {
    const { contract } = useContractDetails();
    if (!contract || contract._isContractDocumentMissing !== true) return null;

    return (
        <>
            <ContractDocumentBadge contract={contract} />
            {contract._contractDocumentCheckedAt && (
                <span className="text-muted small">
                    sprawdzono {ToolsDate.dateYMDtoDMY(contract._contractDocumentCheckedAt.slice(0, 10))}
                </span>
            )}
        </>
    );
}

type DateEditTriggerProps = {
    date?: string | null;
    /** Termin, bez którego umowa jest niekompletna — brak jest błędem do uzupełnienia,
     *  a nie stanem normalnym. Rozpoczęcie i zakończenie są obowiązkowe w walidacji
     *  (ContractValidationSchema.dateFields), gwarancja nie — stąd łagodniejszy komunikat. */
    isRequired?: boolean;
};

function DateEditTrigger({ date, isRequired }: DateEditTriggerProps) {
    const { contract, setContract, contractsRepository } = useContractDetails();
    if (!contract || !setContract) return <Alert variant="danger">Nie wybrano umowy</Alert>;
    if (!contractsRepository) return <Alert variant="danger">Nie znaleziono repozytorium</Alert>;

    return (
        <PartialEditTrigger
            modalProps={{
                initialData: contract,
                modalTitle: "Edycja dat",
                repository: contractsRepository,
                ModalBodyComponent: ContractModalBodyDates,
                onEdit: (contract) => {
                    setContract(contract);
                },
                fieldsToUpdate: [
                    "startDate",
                    "endDate",
                    "guaranteeEndDate",
                    "warrantyEndDate",
                    "defectsNotificationEndDate",
                ],
                makeValidationSchema: contractDatesValidationSchema,
            }}
        >
            {date ? (
                <h5>{ToolsDate.dateYMDtoDMY(date)}</h5>
            ) : (
                // Komunikat siedzi tam, gdzie stałaby data, i jest klikalny tak samo jak ona —
                // czyli jest zarazem informacją o braku i drogą do jego usunięcia.
                <h5 className={isRequired ? "text-danger" : "text-muted fst-italic"}>
                    {isRequired ? "Brak — uzupełnij" : "Jeszcze nie ustalono"}
                </h5>
            )}
        </PartialEditTrigger>
    );
}
