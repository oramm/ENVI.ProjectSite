import React, { useEffect, useState } from "react";
import { Card, ListGroup, Badge } from "react-bootstrap";
import MainSetup from "../../../MainSetupReact";
import { offersRepository } from "../../MainWindowController";
import ToolsDate from "../../../Tools/ToolsDate";
import { ExternalOffer, OurOffer } from "../../../../../Typings/bussinesTypes";

const statusIcons: Record<string, string> = {
    "Składamy czy nie?": "❓",
    "Do złożenia": "📝",
    "Czekamy na wynik": "⏳",
    Wygrana: "🏆",
    Przegrana: "❌",
    Wycofana: "🔙",
    Unieważnione: "🚫",
    "Nie składamy": "🛑",
};

export default function OffersCard({ className }: { className: string }) {
    const [expandedStatus, setExpandedStatus] = useState<Record<string, boolean>>({});
    const [dataLoaded, setDataLoaded] = useState(false);
    const [data, setData] = useState<(OurOffer | ExternalOffer)[] | undefined>(undefined);

    const submissionDeadlineFrom = ToolsDate.addDays(new Date(), -90).toISOString().slice(0, 10);
    const submissionDeadlineTo = ToolsDate.addDays(new Date(), 30).toISOString().slice(0, 10);

    useEffect(() => {
        async function fetchData() {
            setDataLoaded(false);
            const offers = await offersRepository.loadItemsFromServerPOST([
                {
                    statuses: Object.values(MainSetup.OfferStatus),
                    submissionDeadlineFrom,
                    submissionDeadlineTo,
                },
            ]);

            setData(offers);
            setDataLoaded(true);
        }
        fetchData();
    }, []);

    function renderOfferStatusSection<T>(params: {
        sectionData: (OurOffer | ExternalOffer)[];
        status: string;
        expanded: boolean;
        onToggle: () => void;
    }) {
        const { sectionData, status, expanded, onToggle } = params;
        const INITIAL_VISIBLE = 0;
        const visibleData = expanded ? sectionData : sectionData.slice(0, INITIAL_VISIBLE);

        return (
            <ListGroup.Item className="p-0 border-0">
                <div className="d-flex align-items-center list-group-item-action" onClick={onToggle}>
                    <span className="d-flex align-items-center flex-grow-1" style={{ cursor: "pointer" }}>
                        <span style={{ fontSize: 14, width: 14 }}>{statusIcons[status]}</span>
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
                <ul className="ps-4 mt-2 mb-2" style={{ listStyleType: "none" }}>
                    {visibleData.map((offer, i) => renderOfferListItem(offer))}
                </ul>
            </ListGroup.Item>
        );
    }

    function renderOfferListItem(offer: OurOffer | ExternalOffer) {
        return (
            <li key={`${offer.id}`}>
                <span className="text-secondary small">
                    <span className="fw-semibold">{offer._city.name}</span>, {offer._type.name},{" "}
                    <span className="fw-light">{offer.alias}</span>
                </span>
            </li>
        );
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "short" });
    }

    function renderCardTitle() {
        return (
            <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">Oferty</Card.Title>
                <span style={{ fontSize: "0.85em" }} className="text-secondary">
                    {formatDate(submissionDeadlineFrom)} - {formatDate(submissionDeadlineTo)}
                </span>
            </div>
        );
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
                    <Card.Title>Oferty</Card.Title>
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
                    <Card.Title>Oferty</Card.Title>
                    <div className="text-center">
                        <span className="text-secondary">Brak ofert do wyświetlenia</span>
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
                    {(Object.values(MainSetup.OfferStatus) as string[]).map((status) => {
                        const offersInStatus = data.filter((o) => o.status === status);
                        if (offersInStatus.length === 0) return null;

                        return renderOfferStatusSection({
                            sectionData: offersInStatus,
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
