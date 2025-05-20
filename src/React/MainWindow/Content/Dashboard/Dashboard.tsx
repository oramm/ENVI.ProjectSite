import React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import UpcomingEvents from "./UpcominigEvents/UpcomingEvents";
import MyData from "./MyData";
import News from "../News";
import OffersCard from "./OffersCard";
import InvoicesCard from "./InvoicesCard";
import MainSetup from "../../../MainSetupReact";

export default function Dashboard() {
    return (
        <Row className="mx-3">
            <Col md={2} className="mb-3">
                <OffersCard className="mb-3 bg-white" />
                {["ADMIN", "ENVI_MANAGER"].includes(MainSetup.currentUser.systemRoleName) && (
                    <InvoicesCard className="mb-3 bg-white" />
                )}
            </Col>
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
