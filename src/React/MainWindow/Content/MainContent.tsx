import React from "react";
import { Col, Container, Row } from "react-bootstrap";
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
