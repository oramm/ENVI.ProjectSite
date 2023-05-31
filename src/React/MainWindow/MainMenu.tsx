import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import MainSetup from '../MainSetupReact';

export default function MainMenu() {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <>
            <Navbar sticky='top' bg="light" expand="md">
                <Container>
                    <Navbar.Brand>Witryna Projektów</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/" className={isActive('/')}>
                                Strona główna
                            </Nav.Link>
                            <Nav.Link as={Link} to="/contracts" className={isActive('/contracts')}>
                                Kontrakty
                            </Nav.Link>
                            <Nav.Link as={Link} to="/letters" className={isActive('/letters')}>
                                Pisma
                            </Nav.Link>
                            {["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(MainSetup.currentUser.systemRoleName) &&
                                <Nav.Link as={Link} to="/invoices" className={isActive('/invoices')}>
                                    Faktury
                                </Nav.Link>
                            }

                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}
