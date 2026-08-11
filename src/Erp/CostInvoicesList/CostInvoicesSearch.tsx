import React, { useEffect, useState, useCallback } from "react";
import { Alert, Button, Spinner, Modal, Form, Row, Col, Table } from "react-bootstrap";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { CostInvoicesFilterBody } from "./CostInvoicesFilterBody";
import { CostInvoice } from "../../../Typings/bussinesTypes";
import {
    costInvoicesRepository,
    syncFromKsef,
    fetchCostInvoiceReparsePreview,
    applyCostInvoiceReparse,
    CostInvoiceReparsePreviewItem,
} from "./CostInvoicesController";
import Tools from "../../React/Tools/Tools";
import ToolsDate from "../../React/Tools/ToolsDate";
import {
    PaymentStatusBadge,
    PaymentMethodBadge,
    InvoiceTypeBadge,
} from "./CostInvoicesBadges";
import "./CostInvoicesSearch.css";

export default function CostInvoicesSearch({ title }: { title: string }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
    const [syncWarnings, setSyncWarnings] = useState<string[]>([]);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncType, setSyncType] = useState<"INCREMENTAL" | "VERIFICATION">("INCREMENTAL");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [reparseEnabled, setReparseEnabled] = useState(false);
    const [showReparseModal, setShowReparseModal] = useState(false);
    const [reparseLoading, setReparseLoading] = useState(false);
    const [reparseError, setReparseError] = useState<string | null>(null);
    const [reparseSuccess, setReparseSuccess] = useState<string | null>(null);
    const [reparsePreview, setReparsePreview] = useState<CostInvoiceReparsePreviewItem[]>([]);
    const [reparseSelection, setReparseSelection] = useState<Set<number>>(new Set());

    const REPARSE_TOOL_FLAG = "costInvoicesReparseTool";

    useEffect(() => {
        document.title = title;
    }, [title]);

    useEffect(() => {
        setReparseEnabled(sessionStorage.getItem(REPARSE_TOOL_FLAG) === "1");
    }, []);

    const toNumber = (value: unknown): number => {
        if (typeof value === "number") return value;
        if (typeof value === "string") {
            const parsed = Number(value.replace(",", "."));
            return Number.isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    const formatDate = (value?: string | null): string => {
        if (!value) return "-";
        return ToolsDate.dateYMDtoDMY(value);
    };

    const formatAmount = (value: unknown, currency?: string | null): string =>
        `${Tools.formatNumber(toNumber(value))} ${currency || "PLN"}`;

    /**
     * Synchronizacja faktur z KSeF
     */
    const handleSync = useCallback(async () => {
        setIsSyncing(true);
        setSyncError(null);
        setSyncSuccess(null);
        setSyncWarnings([]);
        setShowSyncModal(false);

        try {
            const params: { syncType: "INCREMENTAL" | "VERIFICATION"; dateFrom?: string; dateTo?: string } = {
                syncType,
            };

            if (syncType === "VERIFICATION") {
                if (!dateFrom || !dateTo) {
                    throw new Error("Dla weryfikacji wymagane są daty od i do");
                }
                params.dateFrom = dateFrom;
                params.dateTo = dateTo;
            }

            const result = await syncFromKsef(params);
            const imported = result.data.imported ?? 0;
            const alreadyAdded = result.data.alreadyAdded ?? 0;
            const failedCount = result.data.failedCount ?? 0;
            const errors = result.data.errorDetails || [];

            setSyncSuccess(
                result.message ||
                    `Synchronizacja zakończona: ${imported} zaimportowanych, ${alreadyAdded} już dodane${failedCount > 0 ? `, ${failedCount} błędne` : ""}`
            );

            if (failedCount > 0 && errors.length > 0) {
                setSyncWarnings(errors);
            }

            // Odśwież listę faktur
            await costInvoicesRepository.loadItemsFromServerPOST([]);
        } catch (error) {
            setSyncError(error instanceof Error ? error.message : "Błąd synchronizacji z KSeF");
        } finally {
            setIsSyncing(false);
        }
    }, [syncType, dateFrom, dateTo]);

    const hideReparseTool = () => {
        sessionStorage.removeItem(REPARSE_TOOL_FLAG);
        setReparseEnabled(false);
        setShowReparseModal(false);
        setReparsePreview([]);
        setReparseSelection(new Set());
    };

    const refreshReparsePreview = useCallback(async () => {
        setReparseLoading(true);
        setReparseError(null);
        setReparseSuccess(null);

        try {
            const result = await fetchCostInvoiceReparsePreview();
            const invoices = result.invoices || [];
            setReparsePreview(invoices);
            setReparseSelection(new Set(invoices.map((item) => item.id)));
        } catch (error) {
            setReparseError(error instanceof Error ? error.message : "Błąd podglądu reparse");
        } finally {
            setReparseLoading(false);
        }
    }, []);

    const openReparseModal = async () => {
        setShowReparseModal(true);
        await refreshReparsePreview();
    };

    const toggleReparseSelection = (id: number) => {
        setReparseSelection((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleApplyReparse = async () => {
        if (reparseSelection.size === 0) return;

        setReparseLoading(true);
        setReparseError(null);
        setReparseSuccess(null);

        try {
            const ids = Array.from(reparseSelection);
            const result = await applyCostInvoiceReparse(ids);
            setReparseSuccess(
                `Zastosowano reparse: ${result.updated} zaktualizowanych, ${result.errors.length} błędów`
            );
            await costInvoicesRepository.loadItemsFromServerPOST([]);
            await refreshReparsePreview();
        } catch (error) {
            setReparseError(error instanceof Error ? error.message : "Błąd zastosowania reparse");
        } finally {
            setReparseLoading(false);
        }
    };

    function renderInvoiceCard(invoice: CostInvoice, isActive?: boolean) {
        void isActive;
        const notes = invoice.notes?.trim();

        return (
            <>
                <div className="cost-invoice-card__header">
                    <div>
                        <div className="cost-invoice-card__number">{invoice.invoiceNumber || "-"}</div>
                        <div className="cost-invoice-card__supplier">{invoice.supplierName || "Brak dostawcy"}</div>
                        <div className="cost-invoice-card__meta">
                            NIP: {invoice.supplierNip || "-"}
                            {invoice.supplierAddress ? ` | ${invoice.supplierAddress}` : ""}
                        </div>
                    </div>
                    <div className="cost-invoice-card__status-wrap">
                        <InvoiceTypeBadge invoiceType={invoice.invoiceType} />
                        <PaymentStatusBadge
                            status={invoice.paymentStatus}
                            paidAmount={invoice.paidAmount}
                            grossAmount={toNumber(invoice.grossAmount)}
                        />
                        <PaymentMethodBadge paymentMethod={invoice.paymentMethod} />
                    </div>
                </div>

                <div className="cost-invoice-card__body">
                    <div className="cost-invoice-card__dates">
                        <div className="cost-invoice-card__date-item">
                            <div className="cost-invoice-card__label">Data wyst.</div>
                            <div className="cost-invoice-card__value">{formatDate(invoice.issueDate)}</div>
                        </div>
                        <div className="cost-invoice-card__date-item">
                            <div className="cost-invoice-card__label">Data sprzed.</div>
                            <div className="cost-invoice-card__value">{formatDate(invoice.saleDate)}</div>
                        </div>
                        <div className="cost-invoice-card__date-item">
                            <div className="cost-invoice-card__label">Termin plat.</div>
                            <div className="cost-invoice-card__value">{formatDate(invoice.dueDate)}</div>
                        </div>
                        {invoice.paymentDate && (
                            <div className="cost-invoice-card__date-item">
                                <div className="cost-invoice-card__label">Data zapl.</div>
                                <div className="cost-invoice-card__value cost-invoice-card__value--paid">{formatDate(invoice.paymentDate)}</div>
                            </div>
                        )}
                    </div>

                    <div className="cost-invoice-card__amounts">
                        <div className="cost-invoice-card__gross">{formatAmount(invoice.grossAmount, invoice.currency)}</div>
                        <div className="cost-invoice-card__amount-detail">
                            Netto: {formatAmount(invoice.netAmount, invoice.currency)}
                        </div>
                        <div className="cost-invoice-card__amount-detail">
                            VAT: {formatAmount(invoice.vatAmount, invoice.currency)}
                        </div>
                    </div>
                </div>

                <div className="cost-invoice-card__bottom">
                    <div className="cost-invoice-card__tags">
                        {notes && (
                            <span className="badge bg-secondary-subtle text-secondary-emphasis">Notatka: {notes}</span>
                        )}
                    </div>

                    <div className="cost-invoice-card__footer">
                        <span className="cost-invoice-card__label">KSeF:</span>
                        <code className="cost-invoice-card__ksef">{invoice.ksefNumber || "-"}</code>
                    </div>
                </div>
            </>
        );
    }

    // Przycisk synchronizacji KSeF jako dodatkowy przycisk w nagłówku
    const SyncKsefButton = () => (
        <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowSyncModal(true)}
            disabled={isSyncing}
            className="me-2"
        >
            {isSyncing ? (
                <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Synchronizacja...
                </>
            ) : (
                "Pobierz z KSeF"
            )}
        </Button>
    );

    const ReparseToolButton = () => (
        <Button
            variant="outline-danger"
            size="sm"
            onClick={openReparseModal}
            disabled={reparseLoading}
            className="me-2"
        >
            {reparseLoading ? (
                <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Reparse...
                </>
            ) : (
                "Reparse XML"
            )}
        </Button>
    );

    return (
        <>
            {syncError && (
                <Alert variant="danger" onClose={() => setSyncError(null)} dismissible className="mx-3 mt-3">
                    {syncError}
                </Alert>
            )}
            {syncSuccess && (
                <Alert variant="success" onClose={() => setSyncSuccess(null)} dismissible className="mx-3 mt-3">
                    {syncSuccess}
                </Alert>
            )}
            {syncWarnings.length > 0 && (
                <Alert
                    variant="warning"
                    onClose={() => setSyncWarnings([])}
                    dismissible
                    className="mx-3 mt-3"
                >
                    <div className="fw-semibold mb-1">Faktury z błędami importu:</div>
                    <ul className="mb-0 ps-3">
                        {syncWarnings.map((warning, index) => (
                            <li key={`${index}_${warning}`}>{warning}</li>
                        ))}
                    </ul>
                </Alert>
            )}
            {reparseError && (
                <Alert variant="danger" onClose={() => setReparseError(null)} dismissible className="mx-3 mt-3">
                    {reparseError}
                </Alert>
            )}
            {reparseSuccess && (
                <Alert variant="success" onClose={() => setReparseSuccess(null)} dismissible className="mx-3 mt-3">
                    {reparseSuccess}
                </Alert>
            )}
            <div className="cost-invoices-search">
            <FilterableTable<CostInvoice>
                id="costInvoices"
                title={title}
                FilterBodyComponent={CostInvoicesFilterBody}
                tableStructure={[
                    { header: undefined, renderTdBody: renderInvoiceCard },
                ]}
                AddNewButtonComponents={reparseEnabled ? [SyncKsefButton, ReparseToolButton] : [SyncKsefButton]}
                isDeletable={false}
                isCopyable={false}
                repository={costInvoicesRepository}
                selectedObjectRoute="/cost-invoice/"
            />
            </div>

            {/* Modal synchronizacji */}
            <Modal show={showSyncModal} onHide={() => setShowSyncModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Synchronizacja z KSeF</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Typ synchronizacji</Form.Label>
                        <Form.Select
                            value={syncType}
                            onChange={(e) => setSyncType(e.target.value as "INCREMENTAL" | "VERIFICATION")}
                        >
                            <option value="INCREMENTAL">Przyrostowa (od ostatniej synchronizacji)</option>
                            <option value="VERIFICATION">Weryfikacyjna (zakres dat)</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            {syncType === "INCREMENTAL"
                                ? "Pobiera nowe faktury od ostatniej synchronizacji"
                                : "Pobiera faktury z podanego zakresu dat (do weryfikacji kompletności)"}
                        </Form.Text>
                    </Form.Group>

                    {syncType === "VERIFICATION" && (
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Data od</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Data do</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSyncModal(false)}>
                        Anuluj
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSync}
                        disabled={syncType === "VERIFICATION" && (!dateFrom || !dateTo)}
                    >
                        Synchronizuj
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showReparseModal}
                onHide={() => setShowReparseModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Reparse XML - podgląd zmian</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="text-muted">
                            Wybierz faktury do zastosowania zmian. Pozycje (_items) nie są modyfikowane.
                        </div>
                        <Button variant="outline-secondary" size="sm" onClick={hideReparseTool}>
                            Ukryj narzędzie
                        </Button>
                    </div>

                    {reparseLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : reparsePreview.length === 0 ? (
                        <Alert variant="info">Brak faktur ze zmianami.</Alert>
                    ) : (
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>
                                        <Form.Check
                                            type="checkbox"
                                            checked={reparseSelection.size === reparsePreview.length}
                                            onChange={(event) => {
                                                const next = event.target.checked
                                                    ? new Set(reparsePreview.map((item) => item.id))
                                                    : new Set<number>();
                                                setReparseSelection(next);
                                            }}
                                        />
                                    </th>
                                    <th>Nr faktury</th>
                                    <th>KSeF</th>
                                    <th>Liczba zmian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reparsePreview.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={reparseSelection.has(item.id)}
                                                onChange={() => toggleReparseSelection(item.id)}
                                            />
                                        </td>
                                        <td>{item.invoiceNumber || "-"}</td>
                                        <td>{item.ksefNumber || "-"}</td>
                                        <td>{Object.keys(item.changes || {}).length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}

                    {reparsePreview.length > 0 && reparseSelection.size > 0 && (
                        <div className="mt-3">
                            <div className="fw-semibold">Podgląd zmian (pierwsza wybrana faktura):</div>
                            {(() => {
                                const firstId = Array.from(reparseSelection)[0];
                                const current = reparsePreview.find((item) => item.id === firstId);
                                if (!current) return null;
                                return (
                                    <Table striped bordered size="sm" className="mt-2">
                                        <thead>
                                            <tr>
                                                <th>Pole</th>
                                                <th>Przed</th>
                                                <th>Po</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(current.changes || {}).map(([key, value]) => (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td>{String(value.before ?? "")}</td>
                                                    <td>{String(value.after ?? "")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                );
                            })()}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReparseModal(false)}>
                        Zamknij
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleApplyReparse}
                        disabled={reparseLoading || reparseSelection.size === 0}
                    >
                        Zastosuj zmiany
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
