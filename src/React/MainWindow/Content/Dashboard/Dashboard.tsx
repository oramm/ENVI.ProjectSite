import React from "react";
import { Col, Row } from "react-bootstrap";
import MyData from "./MyData";
import News from "../News";
import OffersCard from "./OffersCard";
import MainSetup from "../../../MainSetupReact";
import InvoicesCard from "./InvoicesCard";
import ApplicationCallsCard from "./ApplicationCallsCard";
import MilestonesCard from "./MilestonesCard";

export default function Dashboard() {
    return (
        <Row className="mx-3">
            <Col md={3} className="mb-3">
                <OffersCard className="mb-3 bg-white" />
                {["ADMIN", "ENVI_MANAGER"].includes(MainSetup.currentUser.systemRoleName) && (
                    <InvoicesCard className="mb-3 bg-white" />
                )}
                <ApplicationCallsCard className="mb-3 bg-white" />
            </Col>
            <Col md={6} className="mb-3">
                <MilestonesCard />
            </Col>
            <Col md={3} className="mb-3">
                <MyData className="mb-3 bg-white" />
                {/* <News className="mb-3 bg-white" /> */}
            </Col>
        </Row>
    );
}
