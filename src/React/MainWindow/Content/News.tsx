// LatestNews.tsx
import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

export default function News() {
    return (
        <Card>
            <Card.Header>Nowości w PS</Card.Header>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <a
                        target={'_blank'}
                        href='https://youtu.be/CYdTj3je_s8'>
                        Dodano ZNWU
                    </a>
                </ListGroup.Item>
                <ListGroup.Item>Dodano panel główny</ListGroup.Item>
            </ListGroup>
        </Card>
    );
};