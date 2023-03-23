import React, { StrictMode, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import ReactDOM from "react-dom/client";
import { BrowserRouter, createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import ContractsSearch from "../Contracts/ContractsList/ContractsSearch";
import { ProgressBar, SpinnerBootstrap } from "../View/Resultsets/CommonComponents";
import ErrorPage from "./ErrorPage";
import MainController from "./MainControllerReact";



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
        return <RouterProvider router={router} />
    else return <SpinnerBootstrap />
}

export async function renderApp() {
    const root = document.getElementById("root");

    if (root) {
        ReactDOM.createRoot(root).render(
            <StrictMode>
                <App />
            </StrictMode>
        );
    }
}

renderApp();