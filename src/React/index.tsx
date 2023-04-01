import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { StrictMode, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import ReactDOM from "react-dom/client";
import { BrowserRouter, createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import ContractsSearch from "../Contracts/ContractsList/ContractsSearch";
import { SpinnerBootstrap } from "../View/Resultsets/CommonComponents";
import ErrorPage from "./ErrorPage";
import GoogleButton from "./GoogleLoginButton";
import MainController from "./MainControllerReact";
import MainSetup from "./MainSetupReact";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [errorMessage, setErrorMessage] = useState('' as string | null);

    const rootPath = '/envi.projectsite/docs/React/';

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

    const router = createBrowserRouter([
        {
            path: `/`,
            element: <ContractsSearch title={"Wyszukiwarka kontraktów"} />,
            errorElement: <ErrorPage />,
        },
        {
            path: `/contract/:id`,
            element: <ContractsSearch title={"test"} />,
            errorElement: <ErrorPage />,
        }
    ], { basename: rootPath });

    if (errorMessage)
        return (
            <div><h1>Ups! mamy błąd</h1>
                <Alert variant="danger"> {errorMessage}</Alert>
            </div>
        )
    else if (isReady)
        return (
            <>
                {isLoggedIn ? (
                    <RouterProvider router={router} />
                ) : (
                    <GoogleButton onServerResponse={handleServerResponse} />
                )}
            </>
        )
    else return <SpinnerBootstrap />
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