import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { StrictMode, useEffect, useState } from "react";
import { Alert, Container } from "react-bootstrap";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import ContractsSearch from "../../Contracts/ContractsList/ContractsSearch";
import InvoiceDetails from "../../Erp/InvoicesList/InvoiceDetails/InvoiceDetails";
import InvoicePdfPreview from "../../Erp/InvoicesList/InvoiceDetails/InvoicePdfPreview";
import InvoicesSearch from "../../Erp/InvoicesList/InvoicesSearch";
import LettersSearch from "../../Letters/LettersList/LettersSearch";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import GoogleButton from "../GoogleLoginButton";
import MainController from "../MainControllerReact";
import MainSetup from "../MainSetupReact";
import Footer from "./Footer";
import MainMenu, { useModuleAccess } from "./MainMenu";
import { installClientErrorReporter } from "./clientErrorReporter";

import CitiesSearch from "../../Admin/Cities/CitiesSearch";
import CarsSearch from "../../Admin/Cars/CarsSearch";
import AbsenceTypesSearch from "../../Admin/AbsenceTypes/AbsenceTypesSearch";
import StaffMembersSearch from "../../Admin/StaffMembers/StaffMembersSearch";
import TypesTreeView from "../../Admin/TypesTree/TypesTreeView";
import SkillsDictionarySearch from "../../Admin/SkillsDictionary/SkillsDictionarySearch";
import ContractRangesSearch from "../../Admin/ContractRanges/ContractRangesSearch";
import BankSyncSearch from "../../Erp/BankSyncList/BankSyncSearch";
import CostInvoicesSearch from "../../Erp/CostInvoicesList/CostInvoicesSearch";
import CostInvoiceDetails from "../../Erp/CostInvoicesList/CostInvoiceDetails";
import { ContractMainViewTabs } from "../../Contracts/ContractsList/ContractDetails/ContractMainViewTabs";
import SecuritiesSearch from "../../Contracts/ContractsList/SecuritiesList/SecuritiesSearch";
import MilestoneDatesSearch from "../../Contracts/Dates/MilestoneDatesSearch";
import RolesSearch from "../../Contracts/Roles/RolesSearch";
import EntitiesSearch from "../../Entities/EntitiesSearch";
import OffersLettersSearch from "../../Offers/OffersLettersList/LettersSearch";
import OffersMainView from "../../Offers/OffersList/OffersMainView";
import PersonsSearch from "../../Persons/PersonsSearch";
import PersonProfilePage from "../../Persons/PersonProfile/PersonProfilePage";
import PublicProfileSubmissionPage from "../../Persons/PersonProfile/PublicProfileSubmission/PublicProfileSubmissionPage";
import TasksGlobal from "../../TasksGlobal/TasksGlobal";
import ScrumboardMainView from "../../Scrumboard/ScrumboardMainView";
import VacationsPage from "../../Vacations/VacationsPage";
import ApplicationCallsSearch from "../../financialAidProgrammes/FocusAreas/ApplicationCalls/ApplicationCallsSearch";
import FocusAreasSearch from "../../financialAidProgrammes/FocusAreas/FocusAreasSearch";
import FinancialAidProgrammesSearch from "../../financialAidProgrammes/Programmes/FinancialAidProgrammesSearch";
import NeedsSearch from "../../financialAidProgrammes/needs/NeedsSearch";
import ProtectedRoute from "../ProtectedRoute";
import MileagePage from "../../Mileage/MileagePage";
import SiteVisitsPage from "../../SiteVisits/SiteVisitsPage";
import PettyCashEntryPage from "../../Erp/PettyCash/PettyCashEntryPage";
import Dashboard from "./Content/Dashboard/Dashboard";
import SbInstallerPage from "../../SecondBrain/SbInstallerPage";
import { GoodTipToast } from "./Content/Dashboard/GoodTipToast";

const rootPath = "/";
console.log("rootPath", rootPath);

/** Telefon/tablet (dotyk) lub zainstalowana aplikacja (standalone). */
function isMobileOrAppView() {
    return (
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(display-mode: standalone)").matches
    );
}
//const rootPath = '/envi.projectsite/docs/React/';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isPublicProfileSubmissionRoute, setIsPublicProfileSubmissionRoute] = useState(false);
    const [errorMessage, setErrorMessage] = useState("" as string | null);
    const currentUser = MainSetup.currentUserOrNull;

    useEffect(() => {
        async function fetchData() {
            if (matchesPublicProfileSubmissionRoute(window.location.hash)) {
                setIsPublicProfileSubmissionRoute(true);
                setIsReady(true);
                return;
            }

            try {
                const hasSession = await MainController.isSessionSet();

                if (!hasSession) {
                    setIsLoggedIn(false);
                    return;
                }

                await MainController.main();
                setIsLoggedIn(true);
            } catch (error) {
                setIsLoggedIn(false);
                if (error instanceof Error) {
                    console.error(error);
                    setErrorMessage(`${error.message}`);
                }
                return;
            } finally {
                setIsReady(true);
            }
        }
        fetchData();
    }, []);
    // Handle the server's response
    async function handleServerResponse(response: any) {
        if (response.userData) {
            // set current user and ensure repositories are initialized before marking logged in
            MainSetup.currentUser = response.userData;
            try {
                setIsReady(false);
                await MainController.main();
                setIsLoggedIn(true);
            } catch (err) {
                console.error(err);
                setErrorMessage(err instanceof Error ? err.message : String(err));
            } finally {
                setIsReady(true);
            }
        } else {
            console.error("Authentication failed:", response.error);
            setErrorMessage(response.errorMessage);
        }
    }

    if (!isReady) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <SpinnerBootstrap />
            </Container>
        );
    }

    if (isPublicProfileSubmissionRoute) {
        return <PublicAppRoutes />;
    }

    if (!isLoggedIn) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100 flex-column">
                {errorMessage && (
                    <Alert variant="danger" className="mb-3">
                        {errorMessage}
                    </Alert>
                )}
                <GoogleButton onServerResponse={handleServerResponse} />
            </Container>
        );
    }

    if (!currentUser) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100 flex-column">
                <SpinnerBootstrap />
                <Alert variant="info" className="mt-3 mb-0">
                    Trwa pobieranie danych użytkownika po zalogowaniu...
                </Alert>
            </Container>
        );
    }

    // zalogowany użytkownik
    return (
        <Container fluid className="d-flex flex-column min-vh-100 p-0 bg-white">
            <AppRoutes />
            <Footer />
        </Container>
    );
}

function AppRoutes() {
    // Faktury kosztowe i bank stoją na flagach StaffMembers, nie na roli - o dostępie
    // rozstrzyga backend, a te same odpowiedzi gaszą pozycje w menu. Trasy rejestrujemy
    // warunkowo, żeby wpisanie adresu z ręki nie otwierało ekranu, który i tak dostanie 403.
    const isStaff = MainSetup.isRoleAllowed(MainSetup.STAFF_ROLES);
    const costInvoicesAccess = useModuleAccess("cost-invoices/access", isStaff);
    const bankAccess = useModuleAccess("bank-transfers/access", isStaff);

    return (
        <HashRouter basename={rootPath}>
            <MainMenu />
            {/* Dobre rady zasłaniają za dużo ekranu na telefonie/w aplikacji - tylko desktop */}
            {!isMobileOrAppView() && <GoodTipToast />}
            <div className="mt-3 mb-3">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* „Dodawanie użytkowników" zniknęło w PER-3 - konta i uprawnienia mieszkają
                        w jednym oknie. Stary adres przekierowuje, bo ludzie mają go w zakładkach;
                        o dostępie rozstrzyga bramka roli przy oknie docelowym, nie ta linia. */}
                    <Route path="/admin/systemUsers" element={<Navigate to="/admin/staffMembers" replace />} />
                    <Route path="/public/experience-update/:token" element={<PublicProfileSubmissionPage />} />
                    <Route path="/letters" element={<LettersSearch title={"Rejestr pism"} />} />
                    {/* Widoki kontraktowe - także dla ról zakresowych (pracownik kontraktowy, klient).
                        Backend zawęża im dane do przypisanych projektów, więc widzą te same ekrany, ale
                        mniej rekordów. Dostęp do kilometrówki i rejestrowania wizyt rozstrzyga dodatkowo
                        flaga w StaffMembers. */}
                    <Route element={<ProtectedRoute allowedRoles={MainSetup.CONTRACT_SCOPED_ROLES} />}>
                        <Route path="/contracts" element={<ContractsSearch title={"Rejestr kontraktów"} />} />
                        <Route
                            path="/contracts/dates"
                            element={<MilestoneDatesSearch title={"Terminy kamieni milowych"} />}
                        />
                        <Route path="/contracts/znwu" element={<SecuritiesSearch title={"ZNWU ENVI"} />} />
                        <Route path="/contract/:id" element={<ContractMainViewTabs />} />
                        <Route path="/tasksGlobal" element={<TasksGlobal />} />
                        <Route path="/mileage" element={<MileagePage />} />
                        <Route path="/mileage/:vehicleId" element={<MileagePage />} />
                        <Route path="/visits" element={<SiteVisitsPage />} />
                        <Route path="/visits/list" element={<SiteVisitsPage />} />
                        <Route path="/visits/:contractId" element={<SiteVisitsPage />} />
                        <Route path="/entities" element={<EntitiesSearch title="Podmioty" />} />
                    </Route>
                    {/* Przegląd cudzych wizyt: pracownicy ENVI widzą wszystkie, klient - tylko
                        z przypisanych projektów (zawęża backend). */}
                    <Route element={<ProtectedRoute allowedRoles={MainSetup.VISITS_OVERVIEW_ROLES} />}>
                        <Route path="/visits/admin" element={<SiteVisitsPage />} />
                    </Route>
                    {/* Panel administracyjny - węższy niż STAFF_ROLES, bo ten obejmuje
                        też ENVI_EMPLOYEE. Musi odpowiadać bramce /admin w backendzie. */}
                    <Route element={<ProtectedRoute allowedRoles={MainSetup.ADMIN_PANEL_ROLES} />}>
                        <Route path="/admin/cars" element={<CarsSearch title="Samochody" />} />
                        <Route
                            path="/admin/absenceTypes"
                            element={<AbsenceTypesSearch title="Typy nieobecności" />}
                        />
                        <Route
                            path="/admin/staffMembers"
                            element={<StaffMembersSearch title="Personel i uprawnienia" />}
                        />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={MainSetup.STAFF_ROLES} />}>
                        {/* Hierarchia typów: PODGLĄD dla każdego pracownika ENVI, edycja
                            tylko dla panelu administracyjnego - rozstrzyga o tym sam widok
                            i bramka zapisu w backendzie, nie ta trasa. Adres zostaje
                            z prefiksem /admin, żeby nie psuć zapisanych odnośników. */}
                        <Route path="/admin/typesTree" element={<TypesTreeView title="Hierarchia typów" />} />
                        <Route path="/contracts/roles" element={<RolesSearch title={"Role kontrakowe"} />} />
                        {/* Zaliczki - ekran projektowany pod telefon, bo tam powstają wpisy
                            (kamera laptopa nie czyta kodu z potwierdzenia nadania).
                            Musi odpowiadać bramce /pettyCash w backendzie. */}
                        <Route path="/pettyCash" element={<PettyCashEntryPage />} />
                        <Route path="/invoices" element={<InvoicesSearch title={"Rejestr faktur"} />} />
                        <Route path="/invoice/:id" element={<InvoiceDetails />} />
                        <Route path="/invoice/:id/ksef/pdf-preview" element={<InvoicePdfPreview />} />
                        <Route path="/scrumboard" element={<ScrumboardMainView />} />
                        <Route path="/vacations" element={<VacationsPage title="Urlopy" />} />
                        <Route path="/persons" element={<PersonsSearch title="Osoby" />} />
                        <Route path="/sbInstaller" element={<SbInstallerPage />} />
                        <Route path="/person/:id" element={<PersonProfilePage />} />
                        <Route path="/admin/cities" element={<CitiesSearch title="Miasta" />} />
                        <Route
                            path="/admin/skills"
                            element={<SkillsDictionarySearch title="Słownik specjalizacji" />}
                        />
                        <Route
                            path="/admin/contractRanges"
                            element={<ContractRangesSearch title="Zakresy kontraktów" />}
                        />
                        <Route path="/offers" element={<OffersMainView title="Oferty" />} />
                        <Route path="/offers/list" element={<OffersMainView title="Oferty" />} />
                        <Route path="/offers/letters" element={<OffersLettersSearch title="Oferty - pisma" />} />
                        <Route
                            path="/financialAidProgrammes"
                            element={<FinancialAidProgrammesSearch title="Programy wsparcia" />}
                        />
                        <Route
                            path="/financialAidProgrammes/focusAreas"
                            element={<FocusAreasSearch title="Działania" />}
                        />
                        <Route
                            path="/financialAidProgrammes/applicationCalls"
                            element={<ApplicationCallsSearch title="Nabory" />}
                        />
                        <Route path="/financialAidProgrammes/needs" element={<NeedsSearch title="Potrzeby" />} />
                    </Route>
                    {/* Faktury kosztowe - flaga StaffMembers.HasCostInvoiceAccess (ADMIN zawsze). */}
                    {costInvoicesAccess && (
                        <Route element={<ProtectedRoute allowedRoles={MainSetup.STAFF_ROLES} />}>
                            <Route path="/costInvoices" element={<CostInvoicesSearch title="Faktury kosztowe" />} />
                            <Route path="/cost-invoice/:id" element={<CostInvoiceDetails />} />
                        </Route>
                    )}
                    {/* Wyciągi bankowe - flaga StaffMembers.HasBankAccess (ADMIN zawsze). */}
                    {bankAccess && (
                        <Route element={<ProtectedRoute allowedRoles={MainSetup.STAFF_ROLES} />}>
                            <Route path="/bankSync" element={<BankSyncSearch title="Wyciągi bankowe" />} />
                        </Route>
                    )}
                    {/* Dodaj tutaj inne ścieżki, jeśli są potrzebne */}
                </Routes>
            </div>
        </HashRouter>
    );
}

function PublicAppRoutes() {
    return (
        <HashRouter basename={rootPath}>
            <Container fluid className="d-flex flex-column min-vh-100 p-0 bg-white">
                <div className="mt-3 mb-3">
                    <Routes>
                        <Route path="/public/experience-update/:token" element={<PublicProfileSubmissionPage />} />
                    </Routes>
                </div>
            </Container>
        </HashRouter>
    );
}

function matchesPublicProfileSubmissionRoute(hash: string): boolean {
    return /^#\/public\/experience-update\/[^/?#]+\/?$/.test(hash);
}

export async function renderApp() {
    installClientErrorReporter();
    
    if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
    }

    const root = document.getElementById("root");

    if (!root) return;
    if (MainSetup.isDevEnvironment)
        ReactDOM.createRoot(root).render(
            <GoogleOAuthProvider clientId={MainSetup.CLIENT_ID}>
                <StrictMode>
                    <App />
                </StrictMode>
            </GoogleOAuthProvider>,
        );
    else
        ReactDOM.createRoot(root).render(
            <GoogleOAuthProvider clientId={MainSetup.CLIENT_ID}>
                <App />
            </GoogleOAuthProvider>,
        );
}
renderApp();
