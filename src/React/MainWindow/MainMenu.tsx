import React, { useState } from "react";
import { Navbar, Nav, Container, Button, Offcanvas, NavDropdown } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import MainSetup from "../MainSetupReact";

export default function MainMenu() {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? "active" : "";
    };

    return (
        <>
            <Navbar sticky="top" bg="light" expand="md">
                <Container>
                    <Navbar.Brand as={Link} to={"/"}>
                        Witryna Projektów
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavDropdown title="Kontrakty" id="basic-nav-dropdown" className={isActive("/contracts")}>
                                <NavDropdown.Item as={Link} to="/contracts">
                                    Wszystkie Kontrakty
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/contracts/znwu">
                                    ZNWU
                                </NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Link as={Link} to="/letters" className={isActive("/letters")}>
                                Pisma
                            </Nav.Link>
                            {["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(
                                MainSetup.currentUser.systemRoleName
                            ) && (
                                <Nav.Link as={Link} to="/invoices" className={isActive("/invoices")}>
                                    Faktury
                                </Nav.Link>
                            )}
                            <Nav.Link as={Link} to="/tasksGlobal" className={isActive("/tasksGlobal")}>
                                Zadania
                            </Nav.Link>
                            <Nav.Link as={Link} to="/entities" className={isActive("/entities")}>
                                Podmioty
                            </Nav.Link>
                            <Nav.Link as={Link} to="/persons" className={isActive("/persons")}>
                                Osoby
                            </Nav.Link>
                            {["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(
                                MainSetup.currentUser.systemRoleName
                            ) && (
                                <>
                                    <Nav.Link as={Link} to="/admin/cities" className={isActive("/admin/cities")}>
                                        Miasta
                                    </Nav.Link>
                                    <NavDropdown title="Oferty" id="basic-nav-dropdown" className={isActive("/offers")}>
                                        <NavDropdown.Item as={Link} to="/offers/list">
                                            Oferty
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/offers/letters">
                                            Pisma do ofert
                                        </NavDropdown.Item>
                                    </NavDropdown>

                                    <NavDropdown
                                        title="Dotacje"
                                        id="basic-nav-dropdown"
                                        className={isActive("/financialAidProgrammes")}
                                    >
                                        <NavDropdown.Item as={Link} to="/financialAidProgrammes">
                                            Programy
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/financialAidProgrammes/focusAreas">
                                            Działania
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/financialAidProgrammes/applicationCalls">
                                            Nabory
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/financialAidProgrammes/needs">
                                            Potrzeby klientów
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}
