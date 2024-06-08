import React from "react";
import { Container, Navbar, Row, Col } from "react-bootstrap";

const Footer: React.FC = () => {
    return (
        <Navbar bg="light" className="mt-auto">
            <Container>
                <Row className="align-items-center w-100">
                    <Col>
                        <Navbar.Text>&copy; {new Date().getFullYear()} ENVI Konsulting</Navbar.Text>
                    </Col>
                    <Col className="text-end">
                        <Navbar.Text>
                            <a
                                href="https://www.envi.com.pl"
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                www.envi.com.pl
                            </a>
                        </Navbar.Text>
                    </Col>
                </Row>
            </Container>
        </Navbar>
    );
};

export default Footer;
