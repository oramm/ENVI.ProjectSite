// LatestNews.tsx
import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

export default function News() {
    return (
        <Card>
            <Card.Header>Nowości w PS</Card.Header>
            <ListGroup variant="flush">
                <ListGroup.Item>Dodano ZNWU</ListGroup.Item>
                <ListGroup.Item>Dodano panel główny</ListGroup.Item>
            </ListGroup>
        </Card>
    );
};