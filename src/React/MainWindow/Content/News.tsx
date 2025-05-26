// News.tsx
import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";

interface NewsProps {
    title?: string;
    className?: string;
    style?: React.CSSProperties;
    items?: string[];
}

export default function News({
    title = "Nowości w PS",
    className,
    style,
    items = [
        "[2025-05-26] Zmieniono kartę ApplicationCallsCard – poprawki statusów i repozytorium.",
        "[2025-05-26] Drobne poprawki w kodzie (commit: poprawki)",
        "[2025-05-26] Drobne poprawki w kodzie (commit: poprawki)",
        "[2025-05-25] Drobne poprawki w kodzie (commit: poprawki)",
        "[2025-05-24] Refaktoryzacja dashboardu (commit: dashboard)",
    ],
}: NewsProps) {
    return (
        <Card className={className} style={style}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="mb-0" style={{ fontWeight: 600, fontSize: 18 }}>
                        {title}
                    </Card.Title>
                </div>
                <ListGroup variant="flush" className="mt-2">
                    {items.length === 0 ? (
                        <ListGroup.Item className="text-secondary">Brak nowości do wyświetlenia.</ListGroup.Item>
                    ) : (
                        items.map((item, index) => (
                            <ListGroup.Item key={index} className="border-0 ps-0 pe-0 py-2 d-flex align-items-center">
                                <span style={{ fontSize: 18, marginRight: 8 }}>📰</span>
                                <span className="text-secondary small">{item}</span>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}
