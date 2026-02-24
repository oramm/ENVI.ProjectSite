// MyDataCard.tsx
import React from "react";
import { Card } from "react-bootstrap";
import MainSetup from "../../../MainSetupReact";

interface MyDataProps {
    title?: string;
    className?: string;
    style?: React.CSSProperties;
    renderExtraContent?: () => React.ReactNode;
}

export default function MyData({ title = "Moje Dane", className, style, renderExtraContent }: MyDataProps) {
    const currentUser = MainSetup.currentUserOrNull;

    if (!currentUser) {
        return (
            <Card className={className} style={style}>
                <Card.Body>
                    <Card.Title className="mb-2" style={{ fontWeight: 600, fontSize: 18 }}>
                        {title}
                    </Card.Title>
                    <div className="text-muted small">Trwa synchronizacja danych użytkownika...</div>
                </Card.Body>
            </Card>
        );
    }

    const { userName, systemEmail, systemRoleName } = currentUser;

    return (
        <Card className={className} style={style}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="mb-0" style={{ fontWeight: 600, fontSize: 18 }}>
                        {title}
                    </Card.Title>
                </div>
                <div className="mb-2">
                    <div className="d-flex align-items-center mb-1">
                        <span style={{ fontSize: 18, marginRight: 8 }}>👤</span>
                        <span className="fw-semibold text-secondary small">{userName}</span>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                        <span style={{ fontSize: 18, marginRight: 8 }}>✉️</span>
                        <span className="text-secondary small">{systemEmail}</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <span style={{ fontSize: 18, marginRight: 8 }}>🔑</span>
                        <span className="text-secondary small">{systemRoleName}</span>
                    </div>
                </div>
                {renderExtraContent && <div className="mt-2">{renderExtraContent()}</div>}
            </Card.Body>
        </Card>
    );
}
