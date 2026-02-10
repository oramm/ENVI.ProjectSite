import React, { useEffect, useState, useCallback } from "react";
import { Alert, Button, Spinner, Modal, Form, Row, Col } from "react-bootstrap";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { CostInvoicesFilterBody } from "./CostInvoicesFilterBody";
import { CostInvoice } from "../../../Typings/bussinesTypes";
import {
    costInvoicesRepository,
    CostInvoiceStatus,
    CostInvoiceStatuses,
    syncFromKsef,
    updateCostInvoice,
} from "./CostInvoicesController";
import Tools from "../../React/Tools/Tools";
import { CostInvoiceStatusBadge, CategoryBadge, VatDeductionBadge } from "./CostInvoicesBadges";
import { useFilterableTableContext } from "../../View/Resultsets/FilterableTable/FilterableTableContext";

export default function CostInvoicesSearch({ title }: { title: string }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncType, setSyncType] = useState<"INCREMENTAL" | "VERIFICATION">("INCREMENTAL");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        document.title = title;
    }, [title]);

    const toNumber = (value: unknown): number => {
        if (typeof value === "number") return value;
        if (typeof value === "string") {
            const parsed = Number(value.replace(",", "."));
            return Number.isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    /**
     * Synchronizacja faktur z KSeF
     */
    const handleSync = useCallback(async () => {
        setIsSyncing(true);
        setSyncError(null);
        setSyncSuccess(null);
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
            setSyncSuccess(result.message || `Zaimportowano ${result.data.imported} faktur, pominięto ${result.data.skipped}`);

            // Odśwież listę faktur
            await costInvoicesRepository.loadItemsFromServerPOST([]);
        } catch (error) {
            setSyncError(error instanceof Error ? error.message : "Błąd synchronizacji z KSeF");
        } finally {
            setIsSyncing(false);
        }
    }, [syncType, dateFrom, dateTo]);

    function renderSupplierInfo(invoice: CostInvoice) {
        return (
            <>
                <div className="fw-bold">{invoice.supplierName}</div>
                <div className="text-muted small">NIP: {invoice.supplierNip}</div>
            </>
        );
    }

    function renderValues(invoice: CostInvoice) {
        const grossAmount = toNumber(invoice.grossAmount);
        const netAmount = toNumber(invoice.netAmount);
        const bookableNetAmount = invoice.bookableNetAmount !== undefined
            ? toNumber(invoice.bookableNetAmount)
            : undefined;

        return (
            <>
                <div className="text-end fw-bold">{Tools.formatNumber(grossAmount)} zł</div>
                <div className="text-end text-muted small">netto: {Tools.formatNumber(netAmount)} zł</div>
                {bookableNetAmount !== undefined && bookableNetAmount !== netAmount && (
                    <div className="text-end text-info small">
                        do księg.: {Tools.formatNumber(bookableNetAmount)} zł
                    </div>
                )}
            </>
        );
    }

    function renderBookingInfo(invoice: CostInvoice) {
        const invoiceWithCategory = invoice as CostInvoice & { _category?: CostInvoice["category"] };
        const category = invoice.category || invoiceWithCategory._category || null;
        const vatDeductionPercentage = toNumber(invoice.vatDeductionPercentage);

        return (
            <div className="d-flex flex-column gap-1">
                <CategoryBadge category={category} />
                <VatDeductionBadge percentage={vatDeductionPercentage} />
            </div>
        );
    }

    function renderKsefNumber(invoice: CostInvoice) {
        return (
            <div className="small">
                <code className="text-break" style={{ fontSize: "0.75em" }}>
                    {invoice.ksefNumber}
                </code>
            </div>
        );
    }

    function CostInvoiceStatusCell({ invoice }: { invoice: CostInvoice }) {
        const { repository, setObjects } = useFilterableTableContext<CostInvoice>();
        const [isUpdating, setIsUpdating] = useState(false);

        const handleStatusChange = async (status: CostInvoiceStatus) => {
            if (status === invoice.status) return;
            setIsUpdating(true);
            setStatusError(null);

            try {
                const updated = await updateCostInvoice(invoice.id, { status });
                repository.replaceItemById(invoice.id, updated);
                repository.saveToSessionStorage();
                setObjects([...repository.items]);
            } catch (error) {
                setStatusError(error instanceof Error ? error.message : "Błąd zmiany statusu");
            } finally {
                setIsUpdating(false);
            }
        };

        if (invoice.status !== CostInvoiceStatuses.NEW) {
            return <CostInvoiceStatusBadge status={invoice.status} />;
        }

        return (
            <div onClick={(e) => e.stopPropagation()}>
                <Form.Select
                    size="sm"
                    value={invoice.status}
                    disabled={isUpdating}
                    onChange={(e) => handleStatusChange(e.target.value as CostInvoiceStatus)}
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value={CostInvoiceStatuses.NEW}>Nowa</option>
                    <option value={CostInvoiceStatuses.EXCLUDED}>Poza kosztami</option>
                    <option value={CostInvoiceStatuses.BOOKED}>Zaksięgowana</option>
                </Form.Select>
            </div>
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
                "🔄 Pobierz z KSeF"
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
            {statusError && (
                <Alert variant="danger" onClose={() => setStatusError(null)} dismissible className="mx-3 mt-3">
                    {statusError}
                </Alert>
            )}

            <FilterableTable<CostInvoice>
                id="costInvoices"
                title={title}
                FilterBodyComponent={CostInvoicesFilterBody}
                tableStructure={[
                    { header: "Nr faktury", objectAttributeToShow: "invoiceNumber", colMd: 1 },
                    { header: "Dostawca", renderTdBody: renderSupplierInfo, colMd: 3 },
                    { header: "Data wyst.", objectAttributeToShow: "issueDate", colMd: 1 },
                    { header: "Termin płat.", objectAttributeToShow: "dueDate", colMd: 1 },
                    { header: "Wartość", renderTdBody: renderValues, colMd: 1 },
                    { header: "Księgowanie", renderTdBody: renderBookingInfo, colMd: 2 },
                    {
                        header: "Status",
                        renderTdBody: (invoice: CostInvoice) => <CostInvoiceStatusCell invoice={invoice} />,
                        colMd: 1,
                    },
                    { header: "Nr KSeF", renderTdBody: renderKsefNumber, colMd: 1 },
                ]}
                AddNewButtonComponents={[SyncKsefButton]}
                isDeletable={false}
                isCopyable={false}
                repository={costInvoicesRepository}
                selectedObjectRoute="/cost-invoice/"
            />

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
        </>
    );
}
