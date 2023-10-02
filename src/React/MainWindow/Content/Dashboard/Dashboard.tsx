import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import UpcomingEvents from './UpcomingEvents';

export default function Dashboard() {
    return (
        <Container>
            <Row>
                <Col md={12}>
                    <UpcomingEvents />
                </Col>
            </Row>
        </Container>
    );
};
