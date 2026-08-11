import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Badge, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import MainController from "../MainControllerReact";
import MainSetup from "../MainSetupReact";

/**
 * O dostępie do modułów flagowych decyduje backend (flagi w StaffMembers), nie rola -
 * dlatego pytamy go wprost i pokazujemy pozycję menu tylko upoważnionym. Błąd sieci
 * albo 401 traktujemy jak brak dostępu: menu ma być węższe, nie szersze.
 *
 * `enabled=false` wyłącza samo zapytanie dla ról, którym trasy modułu i tak odetnie
 * allowlista projectScopedPolicy - inaczej każde ich logowanie zostawiałoby w logach
 * backendu wpis o odmowie dostępu, choć nikt o nic naprawdę nie prosił.
 */
export function useModuleAccess(path: string, enabled = true) {
    const [hasAccess, setHasAccess] = React.useState(false);
    React.useEffect(() => {
        if (!enabled) {
            setHasAccess(false);
            return;
        }
        fetch(`${MainSetup.serverUrl}${path}`, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : { hasAccess: false }))
            .then((d) => setHasAccess(!!d.hasAccess))
            .catch(() => {});
    }, [path, enabled]);
    return hasAccess;
}

export default function MainMenu() {
    const location = useLocation();
    const currentUser = MainSetup.currentUserOrNull;

    // Wizyty na budowie - rola 1/2 albo flaga StaffMembers.CanLogSiteVisits.
    const visitsAccess = useModuleAccess("site-visits/access");
    // Kilometrówka - flaga StaffMembers.IsDriver. Pracownicy ENVI mają ją domyślnie,
    // pracownik kontraktowy nie.
    const mileageAccess = useModuleAccess("mileage/access");
    // Faktury kosztowe i wyciągi bankowe - osobne flagi StaffMembers
    // (HasCostInvoiceAccess, HasBankAccess), więc i osobne pozycje w menu.
    // Oba moduły są firmowe, więc pytamy tylko dla pracowników ENVI.
    const isStaff = !!currentUser && MainSetup.STAFF_ROLES.includes(currentUser.systemRoleName);
    const costInvoicesAccess = useModuleAccess("cost-invoices/access", isStaff);
    const bankAccess = useModuleAccess("bank-transfers/access", isStaff);

    function isActive(path: string) {
        return location.pathname === path ? "active" : "";
    }

    if (!currentUser) {
        return (
            <Navbar sticky="top" bg="light" expand="md">
                <Container>
                    <Navbar.Brand as={Link} to={"/"}>
                        Witryna Projektów
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Navbar.Text className="text-muted">Trwa pobieranie danych użytkownika...</Navbar.Text>
                    </Nav>
                </Container>
            </Navbar>
        );
    }

    const { systemRoleName, userName } = currentUser;

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
                            {MainSetup.CONTRACT_SCOPED_ROLES.includes(systemRoleName) && (
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
                                    {MainSetup.STAFF_ROLES.includes(systemRoleName) && (
                                        <>
                                            <NavDropdown.Item as={Link} to="/scrumboard" className={isActive("/scrumboard")}>
                                                Scrumboard{" "}
                                                <Badge bg="info" text="light">
                                                    nowe
                                                </Badge>
                                            </NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/contracts/roles" className={isActive("/contracts/roles")}>
                                                Role kontrakowe
                                            </NavDropdown.Item>
                                        </>
                                    )}
                                    <NavDropdown.Item as={Link} to="/contracts/dates" className={isActive("/contracts/dates")}>
                                        Terminy
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/contracts/znwu" className={isActive("/contracts/znwu")}>
                                        ZNWU
                                    </NavDropdown.Item>
                                    {mileageAccess && (
                                        <NavDropdown.Item as={Link} to="/mileage" className={isActive("/mileage")}>
                                            Kilometrówka{" "}
                                            <Badge bg="info" text="light">
                                                nowe
                                            </Badge>
                                        </NavDropdown.Item>
                                    )}
                                    {visitsAccess && (
                                        <NavDropdown.Item as={Link} to="/visits" className={isActive("/visits")}>
                                            Wizyty na budowie{" "}
                                            <Badge bg="info" text="light">
                                                nowe
                                            </Badge>
                                        </NavDropdown.Item>
                                    )}
                                </NavDropdown>
                            )}
                            <Nav.Link as={Link} to="/letters" className={isActive("/letters")}>
                                Pisma
                            </Nav.Link>
                            {(() => {
                                const canViewInvoices = MainSetup.STAFF_ROLES.includes(systemRoleName);

                                if (!canViewInvoices) return null;

                                // Rozwijane menu tylko wtedy, gdy jest co rozwijać: same faktury
                                // sprzedażowe zostają zwykłym linkiem, bez strzałki.
                                if (costInvoicesAccess || bankAccess) {
                                    return (
                                        <NavDropdown
                                            title="Faktury"
                                            id="invoices-nav-dropdown"
                                            className={isActive("/invoices")}
                                        >
                                            <NavDropdown.Item
                                                as={Link}
                                                to="/invoices"
                                                className={isActive("/invoices")}
                                            >
                                                Faktury
                                            </NavDropdown.Item>
                                            {costInvoicesAccess && (
                                                <NavDropdown.Item
                                                    as={Link}
                                                    to="/costInvoices"
                                                    className={isActive("/costInvoices")}
                                                >
                                                    Faktury kosztowe
                                                </NavDropdown.Item>
                                            )}
                                            {bankAccess && (
                                                <>
                                                    <NavDropdown.Divider />
                                                    <NavDropdown.Item
                                                        as={Link}
                                                        to="/bankSync"
                                                        className={isActive("/bankSync")}
                                                    >
                                                        Wyciągi bankowe
                                                    </NavDropdown.Item>
                                                </>
                                            )}
                                        </NavDropdown>
                                    );
                                }

                                // Otherwise show plain link to invoices (no expand arrow)
                                return (
                                    <Nav.Link as={Link} to="/invoices" className={isActive("/invoices")}>
                                        Faktury
                                    </Nav.Link>
                                );
                            })()}
                            {MainSetup.CONTRACT_SCOPED_ROLES.includes(systemRoleName) && (
                                <Nav.Link as={Link} to="/entities" className={isActive("/entities")}>
                                    Podmioty
                                </Nav.Link>
                            )}
                            {MainSetup.STAFF_ROLES.includes(systemRoleName) && (
                                <>
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
                                        <NavDropdown.Item as={Link} to="/admin/skills">
                                            Specjalizacje
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
                                        {userName}
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
                                {MainSetup.STAFF_ROLES.includes(systemRoleName) && (
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
