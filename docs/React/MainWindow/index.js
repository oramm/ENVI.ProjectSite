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
require("react-toastify/dist/ReactToastify.css");
const ContractMainViewTabs_1 = require("../../Contracts/ContractsList/ContractDetails/ContractMainViewTabs");
const TasksGlobal_1 = __importDefault(require("../../TasksGlobal/TasksGlobal"));
const SecuritiesSearch_1 = __importDefault(require("../../Contracts/ContractsList/SecuritiesList/SecuritiesSearch"));
const MainContent_1 = __importDefault(require("./Content/MainContent"));
const EntitiesSearch_1 = __importDefault(require("../../Entities/EntitiesSearch"));
const PersonsSearch_1 = __importDefault(require("../../Persons/PersonsSearch"));
const CitiesSearch_1 = __importDefault(require("../../Admin/Cities/CitiesSearch"));
const OffersSearch_1 = __importDefault(require("../../Offers/OffersList/OffersSearch"));
const LettersSearch_2 = __importDefault(require("../../Offers/OffersLettersList/LettersSearch"));
const FinancialAidProgrammesSearch_1 = __importDefault(require("../../financialAidProgrammes/Programmes/FinancialAidProgrammesSearch"));
const FocusAreasSearch_1 = __importDefault(require("../../financialAidProgrammes/FocusAreas/FocusAreasSearch"));
const NeedsSearch_1 = __importDefault(require("../../financialAidProgrammes/needs/NeedsSearch"));
const ApplicationCallsSearch_1 = __importDefault(require("../../financialAidProgrammes/FocusAreas/ApplicationCalls/ApplicationCallsSearch"));
const ContractRangesSearch_1 = __importDefault(require("../../Admin/ContractRanges/ContractRangesSearch"));
const rootPath = "/";
console.log("rootPath", rootPath);
//const rootPath = '/envi.projectsite/docs/React/';
function App() {
    const [isLoggedIn, setIsLoggedIn] = (0, react_1.useState)(false);
    const [isReady, setIsReady] = (0, react_1.useState)(false);
    const [errorMessage, setErrorMessage] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            try {
                await MainControllerReact_1.default.main();
                setIsReady(true);
            }
            catch (error) {
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
    const handleServerResponse = (response) => {
        if (response.userData) {
            MainSetupReact_1.default.currentUser = response.userData;
            setIsLoggedIn(true);
        }
        else {
            console.error("Authentication failed:", response.error);
            setErrorMessage(response.error);
        }
    };
    if (errorMessage)
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "d-flex justify-content-center align-items-center min-vh-100" },
            react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" },
                " ",
                errorMessage)));
    else if (isReady) {
        return isLoggedIn ? (react_1.default.createElement(react_bootstrap_1.Container, { fluid: true, className: "d-flex flex-column min-vh-100 p-0" },
            react_1.default.createElement(AppRoutes, null),
            react_1.default.createElement(Footer_1.default, null))) : (react_1.default.createElement(react_bootstrap_1.Container, { className: "d-flex justify-content-center align-items-center min-vh-100" },
            react_1.default.createElement("div", null,
                react_1.default.createElement(GoogleLoginButton_1.default, { onServerResponse: handleServerResponse }))));
    }
    else
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "d-flex justify-content-center align-items-center min-vh-100" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)));
}
function AppRoutes() {
    return (react_1.default.createElement(react_router_dom_1.HashRouter, { basename: rootPath },
        react_1.default.createElement(MainMenu_1.default, null),
        react_1.default.createElement(react_router_dom_1.Routes, null,
            react_1.default.createElement(react_router_dom_1.Route, { path: "/", element: react_1.default.createElement(MainContent_1.default, null) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/contracts", element: react_1.default.createElement(ContractsSearch_1.default, { title: "Rejestr kontraktów" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/contracts/znwu", element: react_1.default.createElement(SecuritiesSearch_1.default, { title: "ZNWU ENVI" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/contract/:id", element: react_1.default.createElement(ContractMainViewTabs_1.ContractMainViewTabs, null) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/letters", element: react_1.default.createElement(LettersSearch_1.default, { title: "Rejestr pism" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/invoices", element: react_1.default.createElement(InvoicesSearch_1.default, { title: "Rejestr faktur" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/invoice/:id", element: react_1.default.createElement(InvoiceDetails_1.default, null) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/tasksGlobal", element: react_1.default.createElement(TasksGlobal_1.default, null) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/entities", element: react_1.default.createElement(EntitiesSearch_1.default, { title: "Podmioty" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/persons", element: react_1.default.createElement(PersonsSearch_1.default, { title: "Osoby" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/admin/cities", element: react_1.default.createElement(CitiesSearch_1.default, { title: "Miasta" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/admin/contractRanges", element: react_1.default.createElement(ContractRangesSearch_1.default, { title: "Zakresy kontratk\u00F3w" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/offers", element: react_1.default.createElement(OffersSearch_1.default, { title: "Oferty" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/offers/list", element: react_1.default.createElement(OffersSearch_1.default, { title: "Oferty" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/offers/letters", element: react_1.default.createElement(LettersSearch_2.default, { title: "Oferty - pisma" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/financialAidProgrammes", element: react_1.default.createElement(FinancialAidProgrammesSearch_1.default, { title: "Programy wsparcia" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/financialAidProgrammes/focusAreas", element: react_1.default.createElement(FocusAreasSearch_1.default, { title: "Dzia\u0142ania" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/financialAidProgrammes/applicationCalls", element: react_1.default.createElement(ApplicationCallsSearch_1.default, { title: "Nabory" }) }),
            react_1.default.createElement(react_router_dom_1.Route, { path: "/financialAidProgrammes/needs", element: react_1.default.createElement(NeedsSearch_1.default, { title: "Potrzeby" }) }))));
}
async function renderApp() {
    const root = document.getElementById("root");
    if (!root)
        return;
    if (process.env.MODE === "development")
        client_1.default.createRoot(root).render(react_1.default.createElement(google_1.GoogleOAuthProvider, { clientId: MainSetupReact_1.default.CLIENT_ID },
            react_1.default.createElement(react_1.StrictMode, null,
                react_1.default.createElement(App, null))));
    else
        client_1.default.createRoot(root).render(react_1.default.createElement(google_1.GoogleOAuthProvider, { clientId: MainSetupReact_1.default.CLIENT_ID },
            react_1.default.createElement(App, null)));
}
exports.renderApp = renderApp;
console.log(process.env.MODE);
renderApp();
