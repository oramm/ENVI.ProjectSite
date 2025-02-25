import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { StrictMode, useEffect, useState } from "react";
import { Alert, Container } from "react-bootstrap";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import ContractsSearch from "../../Contracts/ContractsList/ContractsSearch";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import GoogleButton from "../GoogleLoginButton";
import MainController from "../MainControllerReact";
import MainMenu from "./MainMenu";
import MainSetup from "../MainSetupReact";
import Footer from "./Footer";
import LettersSearch from "../../Letters/LettersList/LettersSearch";
import InvoicesSearch from "../../Erp/InvoicesList/InvoicesSearch";
import InvoiceDetails from "../../Erp/InvoicesList/InvoiceDetails/InvoiceDetails";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

import { ContractMainViewTabs } from "../../Contracts/ContractsList/ContractDetails/ContractMainViewTabs";
import TasksGlobal from "../../TasksGlobal/TasksGlobal";
import SecuritiesSearch from "../../Contracts/ContractsList/SecuritiesList/SecuritiesSearch";
import MainContent from "./Content/MainContent";
import EntitiesSearch from "../../Entities/EntitiesSearch";
import PersonsSearch from "../../Persons/PersonsSearch";
import CitiesSearch from "../../Admin/Cities/CitiesSearch";
import OffersLettersSearch from "../../Offers/OffersLettersList/LettersSearch";
import FinancialAidProgrammesSearch from "../../financialAidProgrammes/Programmes/FinancialAidProgrammesSearch";
import FocusAreasSearch from "../../financialAidProgrammes/FocusAreas/FocusAreasSearch";
import NeedsSearch from "../../financialAidProgrammes/needs/NeedsSearch";
import ApplicationCallsSearch from "../../financialAidProgrammes/FocusAreas/ApplicationCalls/ApplicationCallsSearch";
import ContractRangesSearch from "../../Admin/ContractRanges/ContractRangesSearch";
import OffersMainView from "../../Offers/OffersList/OffersMainView";

const rootPath = "/";
console.log("rootPath", rootPath);
//const rootPath = '/envi.projectsite/docs/React/';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [errorMessage, setErrorMessage] = useState("" as string | null);

    useEffect(() => {
        async function fetchData() {
            try {
                await MainController.main();
                setIsReady(true);
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error);
                    setErrorMessage(`${error.message}`);
                }
                return;
            }
        }
        fetchData();
    }, []);
    // Handle the server's response
    const handleServerResponse = (response: any) => {
        if (response.userData) {
            MainSetup.currentUser = response.userData;
            setIsLoggedIn(true);
        } else {
            console.error("Authentication failed:", response.error);
            setErrorMessage(response.errorMessage);
        }
    };

    if (errorMessage)
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <Alert variant="danger"> {errorMessage}</Alert>
            </Container>
        );
    else if (isReady) {
        return isLoggedIn ? (
            <Container fluid className="d-flex flex-column min-vh-100 p-0">
                <AppRoutes />
                <Footer />
            </Container>
        ) : (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div>
                    <GoogleButton onServerResponse={handleServerResponse} />
                </div>
            </Container>
        );
    } else
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <SpinnerBootstrap />
            </Container>
        );
}

function AppRoutes() {
    return (
        <HashRouter basename={rootPath}>
            <MainMenu />
            <Routes>
                <Route path="/" element={<MainContent />} />
                <Route path="/contracts" element={<ContractsSearch title={"Rejestr kontraktów"} />} />
                <Route path="/contracts/znwu" element={<SecuritiesSearch title={"ZNWU ENVI"} />} />
                <Route path="/contract/:id" element={<ContractMainViewTabs />} />
                <Route path="/letters" element={<LettersSearch title={"Rejestr pism"} />} />
                <Route path="/invoices" element={<InvoicesSearch title={"Rejestr faktur"} />} />
                <Route path="/invoice/:id" element={<InvoiceDetails />} />
                <Route path="/tasksGlobal" element={<TasksGlobal />} />
                <Route path="/entities" element={<EntitiesSearch title="Podmioty" />} />
                <Route path="/persons" element={<PersonsSearch title="Osoby" />} />
                <Route path="/admin/cities" element={<CitiesSearch title="Miasta" />} />
                <Route path="/admin/contractRanges" element={<ContractRangesSearch title="Zakresy kontratków" />} />
                <Route path="/offers" element={<OffersMainView title="Oferty" />} />
                <Route path="/offers/list" element={<OffersMainView title="Oferty" />} />
                <Route path="/offers/letters" element={<OffersLettersSearch title="Oferty - pisma" />} />
                <Route
                    path="/financialAidProgrammes"
                    element={<FinancialAidProgrammesSearch title="Programy wsparcia" />}
                />
                <Route path="/financialAidProgrammes/focusAreas" element={<FocusAreasSearch title="Działania" />} />
                <Route
                    path="/financialAidProgrammes/applicationCalls"
                    element={<ApplicationCallsSearch title="Nabory" />}
                />
                <Route path="/financialAidProgrammes/needs" element={<NeedsSearch title="Potrzeby" />} />
                {/* Dodaj tutaj inne ścieżki, jeśli są potrzebne */}
            </Routes>
        </HashRouter>
    );
}

export async function renderApp() {
    const root = document.getElementById("root");

    if (!root) return;
    if (process.env.MODE === "development")
        ReactDOM.createRoot(root).render(
            <GoogleOAuthProvider clientId={MainSetup.CLIENT_ID}>
                <StrictMode>
                    <App />
                </StrictMode>
            </GoogleOAuthProvider>
        );
    else
        ReactDOM.createRoot(root).render(
            <GoogleOAuthProvider clientId={MainSetup.CLIENT_ID}>
                <App />
            </GoogleOAuthProvider>
        );
}
console.log(process.env.MODE);
renderApp();
