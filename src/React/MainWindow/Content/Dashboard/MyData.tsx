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
    const { userName, systemEmail, systemRoleName } = MainSetup.currentUser;

    return (
        <Card className={className} style={style}>
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <div>
                    <div>{userName}</div>
                    <div>{systemEmail}</div>
                    <div>{systemRoleName}</div>
                </div>
                {renderExtraContent && <div className="mt-2">{renderExtraContent()}</div>}
            </Card.Body>
        </Card>
    );
}
