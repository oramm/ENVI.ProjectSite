import React from "react";
import { Alert, Col, Row } from "react-bootstrap";
import MyData from "./MyData";
//import News from "../News";
import OffersCard from "./OffersCard";
import MainSetup from "../../../MainSetupReact";
import InvoicesCard from "./InvoicesCard";
import ApplicationCallsCard from "./ApplicationCallsCard";
import MilestonesCard from "./MilestonesCard";
import CyberSecurityCard from "./CyberSecurityCard";
import { SystemRoleName } from "../../../../../Typings/bussinesTypes";

/** Rady bezpieczeństwa dostają osoby pracujące na naszych danych. Poza wykazem
 * zostają EXTERNAL_USER i CLIENT - decyzja właściciela. */
const CYBER_SECURITY_ROLES: SystemRoleName[] = [
    "ADMIN",
    "ENVI_MANAGER",
    "ENVI_EMPLOYEE",
    "ENVI_COOPERATOR",
    "CONTRACT_WORKER",
];

export default function Dashboard() {
    const currentUser = MainSetup.currentUserOrNull;

    if (!currentUser) {
        return (
            <Row className="mx-3">
                <Col>
                    <Alert variant="info" className="mb-0">
                        Trwa pobieranie danych użytkownika. Widok zostanie załadowany po potwierdzeniu sesji.
                    </Alert>
                </Col>
            </Row>
        );
    }

    return (
        <Row className="mx-3">
            <Col md={3} className="mb-3">
                {/* Oferty i nabory to sprawy firmowe - widzą je tylko pracownicy ENVI. */}
                {MainSetup.STAFF_ROLES.includes(currentUser.systemRoleName) && (
                    <OffersCard className="mb-3 bg-white" />
                )}
                {["ADMIN", "ENVI_MANAGER"].includes(currentUser.systemRoleName) && (
                    <InvoicesCard className="mb-3 bg-white" />
                )}
                {MainSetup.STAFF_ROLES.includes(currentUser.systemRoleName) && (
                    <ApplicationCallsCard className="mb-3 bg-white" />
                )}
            </Col>
            <Col md={6} className="mb-3">
                {/* Kafelek ma przycisk edycji i usuwania (isDeletable), a renderował się
                    każdemu - współpracownik i użytkownik zewnętrzny dostawali w ten sposób
                    kamienie milowe z całej bazy do zmiany. Dla pracownika kontraktowego
                    kafelek zostaje: backend przycina mu dane do przypisanych projektów.

                    UWAGA: to jest wyłącznie ukrycie widoku. Trasy PUT/DELETE /milestoneDate/:id
                    nadal sprawdzają tylko to, czy ktoś jest zalogowany - zapis wykonany poza UI
                    (konsola przeglądarki) przejdzie. Właściwa poprawka jest po stronie serwera. */}
                {MainSetup.CONTRACT_SCOPED_ROLES.includes(currentUser.systemRoleName) && (
                    <MilestonesCard />
                )}

                {/* <UpcomingEvents /> */}
            </Col>
            <Col md={3} className="mb-3">
                <MyData className="mb-3 bg-white" />
                {CYBER_SECURITY_ROLES.includes(currentUser.systemRoleName) && (
                    <CyberSecurityCard className="mb-3 bg-white" />
                )}
                {/* <News className="mb-3 bg-white" /> */}
            </Col>
        </Row>
    );
}
