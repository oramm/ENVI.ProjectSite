import React, { useEffect } from "react";
import { Badge } from "react-bootstrap";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { InvoicesFilterBody } from "./InvoiceFilterBody";
import { InvoiceEditModalButton, InvoiceAddNewModalButton } from "./Modals/InvoiceModalButtons";
import { Invoice } from "../../../Typings/bussinesTypes";
import { InvoiceStatusBadge, KsefStatusBadge } from "../../View/Resultsets/CommonComponents";
import { invoicesRepository } from "./InvoicesController";
import Tools from "../../React/Tools/Tools";

export default function InvoicesSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderRow(invoice: Invoice, isActive?: boolean) {
        return (
            <>
                <div className="fw-bold">
                    {invoice._contract?.ourId}
                    {invoice.correctedInvoiceId && (
                        <Badge bg="warning" text="dark" className="ms-2" style={{ fontSize: "0.7em" }}>
                            Korekta
                        </Badge>
                    )}
                    {invoice._corrections && invoice._corrections.length > 0 && (
                        <Badge bg="info" text="light" className="ms-2" style={{ fontSize: "0.7em" }}>
                            Ma korekty ({invoice._corrections.length})
                        </Badge>
                    )}
                </div>
                <div>{invoice._entity.name} </div>
                {invoice.description && <div className="text-muted small"> {invoice.description}</div>}
                {isActive && <div className="mt-2"></div>}
            </>
        );
    }

    function renderInvoiceTotaValue(invoice: Invoice) {
        return (
            <>
                {invoice._totalNetValue && <div className="text-end">{Tools.formatNumber(invoice._totalNetValue)}</div>}
            </>
        );
    }

    return (
        <FilterableTable<Invoice>
            id="invoices"
            title={title}
            FilterBodyComponent={InvoicesFilterBody}
            tableStructure={[
                { header: "Numer", objectAttributeToShow: "number", colMd: 1 },
                { header: "Dane faktury", renderTdBody: renderRow, colMd: 4 },
                { header: "Sprzedaż", objectAttributeToShow: "issueDate", colMd: 1 },
                { header: "Data wystawienia", objectAttributeToShow: "sentDate", colMd: 1 },
                { header: "Netto, zł", renderTdBody: renderInvoiceTotaValue, colMd: 1 },
                { header: "Termin płatności", objectAttributeToShow: "paymentDeadline", colMd: 1 },
                {
                    header: "Status",
                    renderTdBody: (invoice: Invoice) => <InvoiceStatusBadge status={invoice.status} />,
                    colMd: 1,
                },
                {
                    header: "KSeF",
                    renderTdBody: (invoice: Invoice) => (
                        <KsefStatusBadge ksefNumber={invoice.ksefNumber} ksefStatus={invoice.ksefStatus} />
                    ),
                    colMd: 1,
                },
            ]}
            AddNewButtonComponents={[InvoiceAddNewModalButton]}
            EditButtonComponent={InvoiceEditModalButton}
            isDeletable={(invoice: Invoice) => !invoice.ksefNumber}
            isCopyable={true}
            repository={invoicesRepository}
            selectedObjectRoute={"/invoice/"}
        />
    );
}
