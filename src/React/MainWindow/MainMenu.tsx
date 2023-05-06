import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function MainMenu() {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const location = useLocation();

    const handleShowOffcanvas = () => setShowOffcanvas(true);
    const handleCloseOffcanvas = () => setShowOffcanvas(false);

    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <>
            <Navbar sticky='top' bg="light" expand="lg">
                <Container>
                    <Navbar.Brand>Witryna Projektów</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/" className={isActive('/')} onClick={handleCloseOffcanvas}>
                                Strona główna
                            </Nav.Link>
                            <Nav.Link as={Link} to="/contracts" className={isActive('/contracts')} onClick={handleCloseOffcanvas}>
                                Kontrakty
                            </Nav.Link>
                            <Nav.Link as={Link} to="/letters" className={isActive('/letters')} onClick={handleCloseOffcanvas}>
                                Pisma
                            </Nav.Link>
                        </Nav>
                        <Button className="d-lg-none" onClick={handleShowOffcanvas}>
                            Offcanvas menu
                        </Button>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        <Nav.Link as={Link} to="/" className={isActive('/')} onClick={handleCloseOffcanvas}>
                            Strona główna
                        </Nav.Link>
                        <Nav.Link as={Link} to="/pageone" className={isActive('/pageone')} onClick={handleCloseOffcanvas}>
                            Strona 1
                        </Nav.Link>
                        <Nav.Link as={Link} to="/pagetwo" className={isActive('/pagetwo')} onClick={handleCloseOffcanvas}>
                            Strona 2
                        </Nav.Link>
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default MainMenu;
