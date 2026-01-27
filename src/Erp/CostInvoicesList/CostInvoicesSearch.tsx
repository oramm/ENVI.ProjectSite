import React, { useEffect, useState, useCallback } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { CostInvoicesFilterBody } from "./CostInvoicesFilterBody";
import { CostInvoice } from "../../../Typings/bussinesTypes";
import { costInvoicesRepository, CostInvoiceStatuses } from "./CostInvoicesController";
import Tools from "../../React/Tools/Tools";
import MainSetup from "../../React/MainSetupReact";
import { CostInvoiceEditModalButton } from "./Modals/CostInvoiceModalButtons";
import { CostInvoiceStatusBadge, PaidStatusBadge, CompanyCostBadge } from "./CostInvoicesBadges";

export default function CostInvoicesSearch({ title }: { title: string }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

    useEffect(() => {
        document.title = title;
    }, [title]);

    /**
     * Synchronizacja faktur z KSeF
     * Pobiera nowe faktury zakupowe z KSeF i zapisuje je w bazie danych
     */
    const syncFromKsef = useCallback(async () => {
        setIsSyncing(true);
        setSyncError(null);
        setSyncSuccess(null);

        try {
            const response = await fetch(`${MainSetup.serverUrl}costInvoices/ksef/sync`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || `Błąd synchronizacji (${response.status})`);
            }

            const result = await response.json();
            setSyncSuccess(`Zsynchronizowano ${result.newInvoicesCount || 0} nowych faktur z KSeF`);

            // Odśwież listę faktur
            await costInvoicesRepository.loadItemsFromServerPOST([]);
        } catch (error) {
            setSyncError(error instanceof Error ? error.message : "Błąd synchronizacji z KSeF");
        } finally {
            setIsSyncing(false);
        }
    }, []);

    function renderSellerInfo(invoice: CostInvoice) {
        return (
            <>
                <div className="fw-bold">{invoice.sellerName}</div>
                <div className="text-muted small">NIP: {invoice.sellerNip}</div>
                {invoice.description && <div className="text-muted small">{invoice.description}</div>}
            </>
        );
    }

    function renderValues(invoice: CostInvoice) {
        return (
            <>
                {invoice.grossValue && (
                    <div className="text-end fw-bold">{Tools.formatNumber(invoice.grossValue)} zł</div>
                )}
                {invoice.netValue && (
                    <div className="text-end text-muted small">netto: {Tools.formatNumber(invoice.netValue)} zł</div>
                )}
            </>
        );
    }

    function renderFlags(invoice: CostInvoice) {
        return (
            <div className="d-flex flex-column gap-1">
                <CompanyCostBadge isCompanyCost={invoice.isCompanyCost} />
                <PaidStatusBadge isPaid={invoice.isPaid} />
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

    // Przycisk synchronizacji KSeF jako dodatkowy przycisk w nagłówku
    const SyncKsefButton = () => (
        <Button
            variant="outline-primary"
            size="sm"
            onClick={syncFromKsef}
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

            <FilterableTable<CostInvoice>
                id="costInvoices"
                title={title}
                FilterBodyComponent={CostInvoicesFilterBody}
                tableStructure={[
                    { header: "Numer", objectAttributeToShow: "number", colMd: 1 },
                    { header: "Kontrahent", renderTdBody: renderSellerInfo, colMd: 3 },
                    { header: "Data", objectAttributeToShow: "issueDate", colMd: 1 },
                    { header: "Termin płatności", objectAttributeToShow: "paymentDeadline", colMd: 1 },
                    { header: "Wartość brutto", renderTdBody: renderValues, colMd: 1 },
                    { header: "Kategoria", objectAttributeToShow: "costCategory", colMd: 1 },
                    {
                        header: "Status",
                        renderTdBody: (invoice: CostInvoice) => (
                            <CostInvoiceStatusBadge status={invoice.status} />
                        ),
                        colMd: 1,
                    },
                    { header: "Flagi", renderTdBody: renderFlags, colMd: 1 },
                    { header: "Nr KSeF", renderTdBody: renderKsefNumber, colMd: 1 },
                ]}
                AddNewButtonComponents={[SyncKsefButton]}
                EditButtonComponent={CostInvoiceEditModalButton}
                isDeletable={false}
                isCopyable={false}
                repository={costInvoicesRepository}
            />
        </>
    );
}
