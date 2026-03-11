import React, { useEffect, useState, useCallback } from "react";
import { Alert, Button, Spinner, Modal, Form, Row, Col } from "react-bootstrap";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { CostInvoicesFilterBody } from "./CostInvoicesFilterBody";
import { CostInvoice } from "../../../Typings/bussinesTypes";
import {
    costInvoicesRepository,
    CostInvoiceStatuses,
    syncFromKsef,
} from "./CostInvoicesController";
import Tools from "../../React/Tools/Tools";
import ToolsDate from "../../React/Tools/ToolsDate";
import {
    CostInvoiceStatusBadge,
    CategoryBadge,
    VatDeductionBadge,
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

    function renderInvoiceCard(invoice: CostInvoice, isActive?: boolean) {
        void isActive;
        const category = invoice._category || null;
        const vatDeductionPercentage = toNumber(invoice.vatDeductionPercentage);
        const bookingPercentage = toNumber(invoice.bookingPercentage);
        const netAmount = toNumber(invoice.netAmount);
        const bookableNetAmount = invoice.bookableNetAmount !== undefined ? toNumber(invoice.bookableNetAmount) : null;
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
                        <CostInvoiceStatusBadge status={invoice.status} />
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
                        {bookableNetAmount !== null && bookableNetAmount !== netAmount && (
                            <div className="cost-invoice-card__amount-detail cost-invoice-card__amount-detail--info">
                                Do ksieg.: {formatAmount(bookableNetAmount, invoice.currency)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="cost-invoice-card__bottom">
                    <div className="cost-invoice-card__tags">
                        <CategoryBadge category={category} />
                        <VatDeductionBadge percentage={vatDeductionPercentage} />
                        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                            Ksiegowanie {bookingPercentage}%
                        </span>
                        {invoice.status === CostInvoiceStatuses.BOOKED && invoice.bookedAt && (
                            <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">
                                Zaksiegowano {ToolsDate.dateToDDmmmYYYYHHMM(invoice.bookedAt)}
                                {invoice._bookedByPerson
                                    ? ` (${invoice._bookedByPerson.name} ${invoice._bookedByPerson.surname})`
                                    : ""}
                            </span>
                        )}
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
            <div className="cost-invoices-search">
            <FilterableTable<CostInvoice>
                id="costInvoices"
                title={title}
                FilterBodyComponent={CostInvoicesFilterBody}
                tableStructure={[
                    { header: undefined, renderTdBody: renderInvoiceCard },
                ]}
                AddNewButtonComponents={[SyncKsefButton]}
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
        </>
    );
}
