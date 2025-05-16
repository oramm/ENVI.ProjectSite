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
    items = ["Dodano ZNWU", "Dodano panel główny"],
}: NewsProps) {
    return (
        <Card className={className} style={style}>
            <Card.Header>{title}</Card.Header>
            <ListGroup variant="flush">
                {items.map((item, index) => (
                    <ListGroup.Item key={index}>{item}</ListGroup.Item>
                ))}
            </ListGroup>
        </Card>
    );
}
