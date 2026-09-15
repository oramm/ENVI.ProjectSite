import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { Container, Navbar, Row, Col } from "react-bootstrap";

const Footer: React.FC = () => {
    return (
        <Navbar bg="light" className="mt-auto small">
            <Container>
                <Row className="align-items-center justify-content-between flex-nowrap gx-2 w-100">
                    <Col xs="auto">
                        <Navbar.Text className="d-inline-flex align-items-center gap-2">&copy; {new Date().getFullYear()} ENVI Konsulting</Navbar.Text>
                    </Col>
                    <Col xs="auto" className="text-end">
                        <Navbar.Text className="d-inline-flex align-items-center gap-2">
                            <a
                                href="https://www.envi.com.pl"
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                www.envi.com.pl
                            </a>
                            <a href="#/privacy" className="p-1" title="Prywatność i dane osobowe" aria-label="Prywatność i dane osobowe">
                                <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" />
                            </a>
                        </Navbar.Text>
                    </Col>
                </Row>
            </Container>
        </Navbar>
    );
};

export default Footer;
