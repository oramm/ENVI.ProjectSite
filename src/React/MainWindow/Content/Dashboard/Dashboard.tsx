import React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import UpcomingEvents from "./UpcomingEvents";
import MyData from "./MyData";
import News from "../News";

export default function Dashboard() {
    return (
        <Row className="mx-3">
            <Col md={2} className="mb-3"></Col>
            <Col md={8} className="mb-3">
                <UpcomingEvents />
            </Col>
            <Col md={2} className="mb-3">
                <MyData className="mb-3 bg-white" />
                <News className="mb-3 bg-white" />
            </Col>
        </Row>
    );
}
