"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderApp = void 0;
const google_1 = require("@react-oauth/google");
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const client_1 = __importDefault(require("react-dom/client"));
const react_router_dom_1 = require("react-router-dom");
const ContractsSearch_1 = __importDefault(require("../../Contracts/ContractsList/ContractsSearch"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const GoogleLoginButton_1 = __importDefault(require("../GoogleLoginButton"));
const MainControllerReact_1 = __importDefault(require("../MainControllerReact"));
const MainMenu_1 = __importDefault(require("./MainMenu"));
const MainSetupReact_1 = __importDefault(require("../MainSetupReact"));
const Footer_1 = __importDefault(require("./Footer"));
const LettersSearch_1 = __importDefault(require("../../Letters/LettersList/LettersSearch"));
const InvoicesSearch_1 = __importDefault(require("../../Erp/InvoicesList/InvoicesSearch"));
const InvoiceDetails_1 = __importDefault(require("../../Erp/InvoicesList/InvoiceDetails/InvoiceDetails"));
require("bootstrap/dist/css/bootstrap.min.css");
const ContractMainViewTabs_1 = require("../../Contracts/ContractsList/ContractDetails/ContractMainViewTabs");
const TasksGlobal_1 = __importDefault(require("../../TasksGlobal/TasksGlobal"));
const isGithubPages = window.location.hostname === 'ps.envi.com.pl';
const rootPath = isGithubPages ? '/React/' : '/envi.projectsite/docs/React/';
console.log('rootPath', rootPath);
//const rootPath = '/envi.projectsite/docs/React/';
function App() {
    const [isLoggedIn, setIsLoggedIn] = (0, react_1.useState)(false);
    const [isReady, setIsReady] = (0, react_1.useState)(false);
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            try {
                await MainControllerReact_1.default.main();
                setIsReady(true);
            }
            catch (error) {
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
    const handleServerResponse = (response) => {
        if (response.userData) {
            MainSetupReact_1.default.currentUser = response.userData;
            setIsLoggedIn(true);
        }
        else {
            console.log('Authentication failed:', response.error);
        }
    };
    if (errorMessage)
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("h1", null, "Ups! mamy b\u0142\u0105d"),
            react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" },
                " ",
                errorMessage)));
    else if (isReady) {
        return isLoggedIn ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(AppRoutes, null),
            react_1.default.createElement(Footer_1.default, null))) : (react_1.default.createElement(GoogleLoginButton_1.default, { onServerResponse: handleServerResponse }));
    }
    else
        return react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null);
}
function AppRoutes() {
    return (react_1.default.createElement(react_router_dom_1.BrowserRouter, { basename: rootPath },
        react_1.default.createElement(MainMenu_1.default, null),
        react_1.default.createElement(react_router_dom_1.Routes, null,
            react_1.default.createElement(react_router_dom_1.Route, { path: "/", element: react_1.default.createElement(react_1.default.Fragment, null) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/contracts", element: react_1.default.createElement(ContractsSearch_1.default, { title: "Rejestr kontraktów" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/contract/:id", element: react_1.default.createElement(ContractMainViewTabs_1.ContractMainViewTabs, null) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/letters", element: react_1.default.createElement(LettersSearch_1.default, { title: "Rejestr pism" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/invoices", element: react_1.default.createElement(InvoicesSearch_1.default, { title: "Rejestr faktur" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/invoice/:id", element: react_1.default.createElement(InvoiceDetails_1.default, null) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/tasksGlobal", element: react_1.default.createElement(TasksGlobal_1.default, null) }))));
}
async function renderApp() {
    const root = document.getElementById("root");
    if (root) {
        client_1.default.createRoot(root).render(react_1.default.createElement(google_1.GoogleOAuthProvider, { clientId: MainSetupReact_1.default.CLIENT_ID },
            react_1.default.createElement(react_1.StrictMode, null,
                react_1.default.createElement(App, null))));
    }
}
exports.renderApp = renderApp;
renderApp();
