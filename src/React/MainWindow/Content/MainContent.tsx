import React from "react";
import { Col, Container, ListGroup, Row, Card } from "react-bootstrap";
import Dashboard from "./Dashboard/Dashboard";
import MyData from "./Dashboard/MyData";
import News from "./News";

export default function MainContent() {
    return (
        <div className="pt-4 bg-light">
            <Container>
                <Row>
                    <Col md={9}>
                        <Dashboard />
                        <Card className="mt-3">
                            <Card.Header>Dokument</Card.Header>
                            <Card.Body>
                                <Card.Title>argumenty</Card.Title>
                                <Card.Text>
                                    <a href="https://www.google.comhttps://docs.google.com/document/d/1PcHqdu_Oz5wkmVUtCjKGKeeAK7wxkuRvlRaXKiDCDAA/edit?usp=sharing">
                                        https://docs.google.com/document/d/1PcHqdu_Oz5wkmVUtCjKGKeeAK7wxkuRvlRaXKiDCDAA/edit?usp=sharing
                                    </a>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <div className="mb-3">
                            <MyData />
                        </div>
                        <News />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
