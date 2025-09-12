import React, { useState } from "react";
import { Navbar, Nav, Container, Button, Offcanvas, NavDropdown, Badge } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import MainSetup from "../MainSetupReact";
import MainController from "../MainControllerReact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

export default function MainMenu() {
    const location = useLocation();

    function isActive(path: string) {
        return location.pathname === path ? "active" : "";
    }

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
                            {["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(
                                MainSetup.currentUser.systemRoleName
                            ) && (
                                <NavDropdown
                                    title="Kontrakty"
                                    id="basic-nav-dropdown"
                                    className={isActive("/contracts")}
                                >
                                    <NavDropdown.Item as={Link} to="/contracts" className={isActive("/contracts")}>
                                        Wszystkie Kontrakty
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/tasksGlobal" className={isActive("/tasksGlobal")}>
                                        Projekty i zadania
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                        as={Link}
                                        to="/contracts/roles"
                                        className={isActive("/contracts/roles")}
                                    >
                                        Role kontrakowe{" "}
                                        <Badge bg="info" text="light">
                                            nowe
                                        </Badge>
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                        as={Link}
                                        to="/contracts/dates"
                                        className={isActive("/contracts/dates")}
                                    >
                                        Terminy{" "}
                                        <Badge bg="info" text="light">
                                            nowe
                                        </Badge>
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                        as={Link}
                                        to="/contracts/znwu"
                                        className={isActive("/contracts/znwu")}
                                    >
                                        ZNWU{" "}
                                        <Badge bg="info" text="light">
                                            nowe
                                        </Badge>
                                    </NavDropdown.Item>
                                </NavDropdown>
                            )}
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
                            {["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(
                                MainSetup.currentUser.systemRoleName
                            ) && (
                                <>
                                    <Nav.Link as={Link} to="/entities" className={isActive("/entities")}>
                                        Podmioty
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/persons" className={isActive("/persons")}>
                                        Osoby
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
                                    <Nav.Item className="nav-separator">|</Nav.Item>
                                    <NavDropdown
                                        title="Słowniki"
                                        id="parametry-nav-dropdown"
                                        className={isActive("/admin")}
                                    >
                                        <NavDropdown.Item as={Link} to="/admin/cities">
                                            Miasta
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/contractRanges">
                                            Zakresy kontraktów{" "}
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </>
                            )}
                        </Nav>
                        <Nav className="ms-auto">
                            <NavDropdown
                                title={
                                    <>
                                        <FontAwesomeIcon icon={faCircleUser} className="me-2" />
                                        {MainSetup.currentUser.userName}
                                    </>
                                }
                                id="user-nav-dropdown"
                            >
                                <NavDropdown.Item
                                    onClick={async () => {
                                        await MainController.logout();
                                        window.location.reload();
                                    }}
                                >
                                    Wyloguj się
                                </NavDropdown.Item>
                                {["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(
                                MainSetup.currentUser.systemRoleName
                                ) && (
                                    <>
                                        <NavDropdown.Item as={Link} to="/admin/systemUsers">
                                            Dodaj użytkownika
                                        </NavDropdown.Item>
                                    </>
                                )}
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}
