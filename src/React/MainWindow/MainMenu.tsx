import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Badge, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import MainController from "../MainControllerReact";
import MainSetup from "../MainSetupReact";
import { useSbAccess } from "../../SecondBrain/sbAccessApi";

/**
 * O dostępie do modułów flagowych decyduje backend (flagi w StaffMembers), nie rola -
 * dlatego pytamy go wprost i pokazujemy pozycję menu tylko upoważnionym. Błąd sieci
 * albo 401 traktujemy jak brak dostępu: menu ma być węższe, nie szersze.
 */
export async function fetchModuleAccess(path: string) {
    try {
        const response = await fetch(`${MainSetup.serverUrl}${path}`, { credentials: "include" });
        const data = response.ok ? await response.json() : { hasAccess: false };
        return !!data.hasAccess;
    } catch {
        return false;
    }
}

/**
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
        fetchModuleAccess(path).then(setHasAccess);
    }, [path, enabled]);
    return hasAccess;
}

/** Adresy, pod którymi podświetla się rozwijane menu „Biuro” (w tym pozycje panelu administracyjnego). */
const OFFICE_PATHS = [
    "/mileage",
    "/pettyCash",
    "/vacations",
    "/scrumboard",
    "/admin/cities",
    "/admin/contractRanges",
    "/admin/skills",
    "/admin/typesTree",
    "/admin/absenceTypes",
    "/admin/cars",
    "/admin/staffMembers",
    "/admin/sbAccess",
    "/admin/softwareLicenses",
];

/** Adresy menu „Kontakty”: podmioty, osoby i lista podmiotów z GUS. */
const CONTACTS_PATHS = ["/entities", "/persons", "/person/", "/admin/gusEntities"];

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
    const sbAccess = useSbAccess(isStaff);

    function isActive(path: string) {
        return location.pathname === path ? "active" : "";
    }

    function isActiveIn(paths: string[]) {
        return paths.some(path => location.pathname.startsWith(path)) ? "active" : "";
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
    const isAdminPanel = MainSetup.ADMIN_PANEL_ROLES.includes(systemRoleName);
    const canSeeEntities = MainSetup.CONTRACT_SCOPED_ROLES.includes(systemRoleName);
    const sbGranted = sbAccess.state === "granted";
    // ENVI Podpis tylko dla pracowników ENVI (STAFF_ROLES): backend zamyka trasy programu
    // (/signing/program/info, /signing/program/download) przed rolami zakresowymi - allowlista
    // projectScopedPolicy daje im 403. Pozycja menu ma być węższa, nie szersza od serwera.
    const showEnviPodpis = isStaff;

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
                                        <NavDropdown.Item as={Link} to="/contracts/roles" className={isActive("/contracts/roles")}>
                                            Role kontrakowe
                                        </NavDropdown.Item>
                                    )}
                                    <NavDropdown.Item as={Link} to="/contracts/dates" className={isActive("/contracts/dates")}>
                                        Terminy
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/contracts/znwu" className={isActive("/contracts/znwu")}>
                                        ZNWU
                                    </NavDropdown.Item>
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
                            {isStaff && (
                                <NavDropdown title="Oferty" id="basic-nav-dropdown" className={isActive("/offers")}>
                                    <NavDropdown.Item as={Link} to="/offers/list">
                                        Oferty
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/offers/letters">
                                        Pisma do ofert
                                    </NavDropdown.Item>
                                </NavDropdown>
                            )}
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
                            {canSeeEntities && (
                                // Osoba zakresowa (pracownik kontraktowy, klient) widzi tylko podmioty -
                                // wtedy zwykły link, bez pustego rozwijania.
                                isStaff || isAdminPanel ? (
                                    <NavDropdown
                                        title="Kontakty"
                                        id="contacts-nav-dropdown"
                                        className={isActiveIn(CONTACTS_PATHS)}
                                    >
                                        <NavDropdown.Item as={Link} to="/entities" className={isActive("/entities")}>
                                            Podmioty
                                        </NavDropdown.Item>
                                        {isStaff && (
                                            <NavDropdown.Item as={Link} to="/persons" className={isActive("/persons")}>
                                                Osoby
                                            </NavDropdown.Item>
                                        )}
                                        {isAdminPanel && (
                                            <>
                                                <NavDropdown.Divider />
                                                <NavDropdown.Item as={Link} to="/admin/gusEntities" className={isActive("/admin/gusEntities")}>
                                                    Podmioty w GUS
                                                </NavDropdown.Item>
                                            </>
                                        )}
                                    </NavDropdown>
                                ) : (
                                    <Nav.Link as={Link} to="/entities" className={isActive("/entities")}>
                                        Podmioty
                                    </Nav.Link>
                                )
                            )}
                            {isStaff && (
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
                            )}
                            {/* Biuro: organizacja pracy (scrumboard, urlopy), koszty (kilometrówka, zaliczki),
                                słowniki i administracja. Każda pozycja ma własną bramkę; administratorzy
                                są w STAFF_ROLES, więc warunek otwarcia menu nie musi się zmieniać. */}
                            {(mileageAccess || isStaff) && (
                                <NavDropdown
                                    title="Biuro"
                                    id="office-nav-dropdown"
                                    className={isActiveIn(OFFICE_PATHS)}
                                >
                                    {isStaff && (
                                        <NavDropdown.Item
                                            as={Link}
                                            to="/scrumboard"
                                            className={isActive("/scrumboard")}
                                        >
                                            Scrumboard
                                        </NavDropdown.Item>
                                    )}
                                    {isStaff && (
                                        <NavDropdown.Item
                                            as={Link}
                                            to="/vacations"
                                            className={isActive("/vacations")}
                                        >
                                            Urlopy
                                        </NavDropdown.Item>
                                    )}
                                    {mileageAccess && (
                                        <NavDropdown.Item
                                            as={Link}
                                            to="/mileage"
                                            className={isActive("/mileage")}
                                        >
                                            Kilometrówka
                                        </NavDropdown.Item>
                                    )}
                                    {isStaff && (
                                        <NavDropdown.Item
                                            as={Link}
                                            to="/pettyCash"
                                            className={isActive("/pettyCash")}
                                        >
                                            Zaliczki
                                        </NavDropdown.Item>
                                    )}
                                    {isStaff && (
                                        <>
                                            <NavDropdown.Divider />
                                            <NavDropdown.Header>Słowniki</NavDropdown.Header>
                                            <NavDropdown.Item as={Link} to="/admin/cities" className={isActive("/admin/cities")}>
                                                Miasta
                                            </NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/admin/contractRanges" className={isActive("/admin/contractRanges")}>
                                                Zakresy kontraktów
                                            </NavDropdown.Item>
                                            <NavDropdown.Item as={Link} to="/admin/skills" className={isActive("/admin/skills")}>
                                                Specjalizacje
                                            </NavDropdown.Item>
                                            {/* Hierarchia typów - jedna pozycja dla wszystkich pracowników ENVI.
                                                Dawny duplikat w panelu administracyjnym usunięto. */}
                                            <NavDropdown.Item as={Link} to="/admin/typesTree" className={isActive("/admin/typesTree")}>
                                                Hierarchia typów
                                            </NavDropdown.Item>
                                            {isAdminPanel && (
                                                <>
                                                    <NavDropdown.Item as={Link} to="/admin/absenceTypes" className={isActive("/admin/absenceTypes")}>
                                                        Typy nieobecności
                                                    </NavDropdown.Item>
                                                    <NavDropdown.Item as={Link} to="/admin/cars" className={isActive("/admin/cars")}>
                                                        Samochody
                                                    </NavDropdown.Item>
                                                </>
                                            )}
                                        </>
                                    )}
                                    {isAdminPanel && (
                                        <>
                                            <NavDropdown.Divider />
                                            <NavDropdown.Header>Administracja</NavDropdown.Header>
                                            <NavDropdown.Item as={Link} to="/admin/staffMembers" className={isActive("/admin/staffMembers")}>
                                                Personel i uprawnienia
                                            </NavDropdown.Item>
                                            {/* Serwer i tak odmówi bez uprawnienia; pozycja menu to tylko wygoda. */}
                                            {sbAccess.access?.canManage === true && (
                                                <NavDropdown.Item as={Link} to="/admin/sbAccess" className={isActive("/admin/sbAccess")}>
                                                    Dostęp do Second Brain
                                                </NavDropdown.Item>
                                            )}
                                            <NavDropdown.Item as={Link} to="/admin/softwareLicenses" className={isActive("/admin/softwareLicenses")}>
                                                Licencje
                                            </NavDropdown.Item>
                                        </>
                                    )}
                                </NavDropdown>
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
                                {(showEnviPodpis || sbGranted) && <NavDropdown.Header>Narzędzia</NavDropdown.Header>}
                                {showEnviPodpis && (
                                    <NavDropdown.Item as={Link} to="/enviPodpis">
                                        ENVI Podpis
                                    </NavDropdown.Item>
                                )}
                                {/* Rejestr SB w PS decyduje o dostępie. Serwer odmówi też pobrania
                                    paczki osobom bez dostępu; pozycja menu to tylko wygoda. */}
                                {sbGranted && (
                                    <NavDropdown.Item as={Link} to="/sbInstaller">
                                        Second Brain
                                    </NavDropdown.Item>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item
                                    onClick={async () => {
                                        await MainController.logout();
                                        window.location.reload();
                                    }}
                                >
                                    Wyloguj się
                                </NavDropdown.Item>
                                {/* „Dodaj użytkownika" zniknęło stąd w PER-3: konta zakłada się
                                    w oknie „Personel i uprawnienia” (menu Biuro › Administracja),
                                    a nie z menu użytkownika. Osobę bez konta dalej dodaje się
                                    w oknie „Osoby". */}
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}
