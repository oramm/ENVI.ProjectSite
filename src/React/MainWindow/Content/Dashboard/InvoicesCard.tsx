import React, { useEffect, useState } from "react";
import { Card, ListGroup, Badge } from "react-bootstrap";
import MainSetup from "../../../MainSetupReact";
import { invoicesRepository } from "../../MainWindowController";
import ToolsDate from "../../../Tools/ToolsDate";
import { Invoice } from "../../../../../Typings/bussinesTypes";
import Tools from "../../../Tools/Tools";

const invoiceStatusIcons: Record<string, string> = {
    "Na później": "⏳",
    "Do zrobienia": "📝",
    Zrobiona: "✅",
    Wysłana: "📤",
    Zapłacona: "💸",
    "Do korekty": "✏️",
    Wycofana: "🚫",
};

export default function InvoicesCard({ className }: { className: string }) {
    const [expandedStatus, setExpandedStatus] = useState<Record<string, boolean>>({});
    const [dataLoaded, setDataLoaded] = useState(false);
    const [data, setData] = useState<Invoice[] | undefined>(undefined);
    const INITIAL_VISIBLE = 0;

    // Przykład zakresu dat – podmień na logikę pod projekt!
    const issueDateFrom = ToolsDate.addDays(new Date(), -60).toISOString().slice(0, 10);
    const issueDateTo = ToolsDate.addDays(new Date(), 30).toISOString().slice(0, 10);

    useEffect(() => {
        async function fetchData() {
            setDataLoaded(false);
            const invoices = (await invoicesRepository.loadItemsFromServerPOST([
                {
                    statuses: Object.values(MainSetup.InvoiceStatuses),
                    issueDateFrom,
                    issueDateTo,
                },
            ])) as Invoice[];
            setData(invoices);
            setDataLoaded(true);
        }
        fetchData();
    }, []);

    function renderInvoiceStatusSection(params: {
        sectionData: any[];
        status: string;
        expanded: boolean;
        onToggle: () => void;
    }) {
        const { sectionData, status, expanded, onToggle } = params;
        const visibleData = expanded ? sectionData : sectionData.slice(0, INITIAL_VISIBLE);
        const totalValue = Tools.formatNumber(getTotalValue(sectionData)) + " zł";

        return (
            <ListGroup.Item key={status} className="p-0 border-0">
                <div
                    className="d-flex align-items-center list-group-item-action"
                    style={{ cursor: "pointer" }}
                    onClick={onToggle}
                >
                    <span className="d-flex align-items-center flex-grow-1">
                        <span style={{ fontSize: 14, width: 14 }}>{invoiceStatusIcons[status] || "📄"}</span>
                        <span className="ms-2 fw-semibold">{status}</span>
                    </span>
                    <span className="d-flex align-items-center">
                        <Badge bg="light" text="dark">
                            {sectionData.length}
                        </Badge>
                        <span className="text-secondary small ms-2" style={{ fontSize: "0.9em" }}>
                            {expanded ? "▼" : "▸"}
                        </span>
                    </span>
                </div>
                <div className="ps-4">
                    <span className="small text-secondary">Łącznie: {totalValue}</span>
                </div>
                <ul className="ps-4 mt-2 mb-2" style={{ listStyleType: "none" }}>
                    {visibleData.map((invoice) => renderListItem(invoice))}
                </ul>
            </ListGroup.Item>
        );
    }

    function renderListItem(invoice: Invoice) {
        return (
            <li key={invoice.id} className="mb-2 d-flex align-items-center">
                <span className="text-secondary small flex-grow-1">
                    <span className="fw-semibold">{invoice._contract.ourId}</span>
                    {", "}
                    {invoice.number || invoice._contract._city?.name}
                </span>
                <span className="text-secondary small text-end ms-2" style={{ minWidth: 70 }}>
                    <span className="fw-light">{Tools.formatNumber(invoice._totalNetValue || 0)} zł</span>
                </span>
            </li>
        );
    }

    function renderCardTitle() {
        return (
            <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">Faktury</Card.Title>
                <span style={{ fontSize: "0.85em" }} className="text-secondary">
                    {ToolsDate.dateToDdMmm(issueDateFrom)} - {ToolsDate.dateToDdMmm(issueDateTo)}
                </span>
            </div>
        );
    }

    function getTotalValue(invoices: Invoice[] = []) {
        return invoices.reduce((acc, inv) => {
            // Zamieni wszystko (number, undefined, string) na string, więc replace zawsze istnieje
            const raw = inv._totalNetValue;
            const num = parseFloat(String(raw).replace(",", "."));
            return acc + (isNaN(num) ? 0 : num);
        }, 0);
    }

    function handleToggle(status: string) {
        setExpandedStatus((prev) => ({
            ...prev,
            [status]: !prev[status],
        }));
    }

    if (!dataLoaded) {
        return (
            <Card className={className}>
                <Card.Body>
                    <Card.Title>Faktury</Card.Title>
                    <div className="text-center">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className={className}>
                <Card.Body>
                    <Card.Title>Faktury</Card.Title>
                    <div className="text-center">
                        <span className="text-secondary">Brak faktur do wyświetlenia</span>
                    </div>
                </Card.Body>
            </Card>
        );
    }
    return (
        <Card className={className}>
            <Card.Body>
                {renderCardTitle()}
                <ListGroup variant="flush" className="mt-3">
                    {(Object.values(MainSetup.InvoiceStatuses) as string[]).map((status) => {
                        const invoicesInStatus = data.filter((inv) => inv.status === status);
                        if (invoicesInStatus.length === 0) return null;

                        return renderInvoiceStatusSection({
                            sectionData: invoicesInStatus,
                            status,
                            expanded: expandedStatus[status] || false,
                            onToggle: () => handleToggle(status),
                        });
                    })}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}
