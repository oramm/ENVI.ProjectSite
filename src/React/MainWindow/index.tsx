import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { StrictMode, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import ReactDOM from "react-dom/client";
import { BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes, useNavigate } from "react-router-dom";
import ContractsSearch from "../../Contracts/ContractsList/ContractsSearch";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import ErrorPage from "../ErrorPage";
import GoogleButton from "../GoogleLoginButton";
import MainController from "../MainControllerReact";
import MainMenu from "./MainMenu";
import MainSetup from "../MainSetupReact";
import Footer from "./Footer";

const rootPath = '/envi.projectsite/docs/React/';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [errorMessage, setErrorMessage] = useState('' as string | null);



    useEffect(() => {
        async function fetchData() {
            try {
                await MainController.main();
                setIsReady(true);
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error);
                    setErrorMessage(`${error.name} ${error.message}`);
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
            console.log('Authentication failed:', response.error);
        }
    };

    if (errorMessage)
        return (
            <div>
                <h1>Ups! mamy błąd</h1>
                <Alert variant="danger"> {errorMessage}</Alert>
            </div>
        )
    else if (isReady) {
        return isLoggedIn ? (
            <>
                <AppRoutes />
                <Footer />
            </>

        ) : (
            <GoogleButton onServerResponse={handleServerResponse} />
        );
    }
    else
        return <SpinnerBootstrap />
}

function AppRoutes() {
    return (
        <BrowserRouter basename={rootPath}>
            <MainMenu />
            <Routes>
                <Route path="/" element={<ContractsSearch title={"Strona główna"} />} />
                <Route path="/contracts" element={<ContractsSearch title={"Wyszukiwarka kontraktów"} />} />
                <Route path="/contract/:id" element={<ContractsSearch title={"test"} />} />
                {/* Dodaj tutaj inne ścieżki, jeśli są potrzebne */}
            </Routes>
        </BrowserRouter>
    );
}


export async function renderApp() {
    const root = document.getElementById("root");

    if (root) {
        ReactDOM.createRoot(root).render(
            <GoogleOAuthProvider clientId={MainSetup.CLIENT_ID}>
                <StrictMode>
                    <App />
                </StrictMode>
            </GoogleOAuthProvider>
        );
    }
}

renderApp();