// LatestNews.tsx
import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

export default function News() {
    return (
        <Card>
            <Card.Header>Najnowsze Wiadomości</Card.Header>
            <ListGroup variant="flush">
                <ListGroup.Item>Wiadomość 1</ListGroup.Item>
                <ListGroup.Item>Wiadomość 2</ListGroup.Item>
                <ListGroup.Item>Wiadomość 3</ListGroup.Item>
                <ListGroup.Item>Wiadomość 4</ListGroup.Item>
            </ListGroup>
        </Card>
    );
};