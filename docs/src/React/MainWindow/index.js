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
require("bootstrap/dist/css/bootstrap.min.css");
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const client_1 = __importDefault(require("react-dom/client"));
const react_router_dom_1 = require("react-router-dom");
require("react-toastify/dist/ReactToastify.css");
const ContractsSearch_1 = __importDefault(require("../../Contracts/ContractsList/ContractsSearch"));
const InvoiceDetails_1 = __importDefault(require("../../Erp/InvoicesList/InvoiceDetails/InvoiceDetails"));
const InvoicesSearch_1 = __importDefault(require("../../Erp/InvoicesList/InvoicesSearch"));
const LettersSearch_1 = __importDefault(require("../../Letters/LettersList/LettersSearch"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const GoogleLoginButton_1 = __importDefault(require("../GoogleLoginButton"));
const MainControllerReact_1 = __importDefault(require("../MainControllerReact"));
const MainSetupReact_1 = __importDefault(require("../MainSetupReact"));
const Footer_1 = __importDefault(require("./Footer"));
const MainMenu_1 = __importDefault(require("./MainMenu"));
const CitiesSearch_1 = __importDefault(require("../../Admin/Cities/CitiesSearch"));
const SkillsDictionarySearch_1 = __importDefault(require("../../Admin/SkillsDictionary/SkillsDictionarySearch"));
const ContractRangesSearch_1 = __importDefault(require("../../Admin/ContractRanges/ContractRangesSearch"));
const SystemUsersSearch_1 = __importDefault(require("../../Admin/SystemUsers/SystemUsersSearch"));
const CostInvoicesSearch_1 = __importDefault(require("../../Erp/CostInvoicesList/CostInvoicesSearch"));
const CostInvoiceDetails_1 = __importDefault(require("../../Erp/CostInvoicesList/CostInvoiceDetails"));
const CostInvoicesReport_1 = __importDefault(require("../../Erp/CostInvoicesList/CostInvoicesReport"));
const ContractMainViewTabs_1 = require("../../Contracts/ContractsList/ContractDetails/ContractMainViewTabs");
const SecuritiesSearch_1 = __importDefault(require("../../Contracts/ContractsList/SecuritiesList/SecuritiesSearch"));
const MilestoneDatesSearch_1 = __importDefault(require("../../Contracts/Dates/MilestoneDatesSearch"));
const RolesSearch_1 = __importDefault(require("../../Contracts/Roles/RolesSearch"));
const EntitiesSearch_1 = __importDefault(require("../../Entities/EntitiesSearch"));
const LettersSearch_2 = __importDefault(require("../../Offers/OffersLettersList/LettersSearch"));
const OffersMainView_1 = __importDefault(require("../../Offers/OffersList/OffersMainView"));
const PersonsSearch_1 = __importDefault(require("../../Persons/PersonsSearch"));
const PersonProfilePage_1 = __importDefault(require("../../Persons/PersonProfile/PersonProfilePage"));
const TasksGlobal_1 = __importDefault(require("../../TasksGlobal/TasksGlobal"));
const ApplicationCallsSearch_1 = __importDefault(require("../../financialAidProgrammes/FocusAreas/ApplicationCalls/ApplicationCallsSearch"));
const FocusAreasSearch_1 = __importDefault(require("../../financialAidProgrammes/FocusAreas/FocusAreasSearch"));
const FinancialAidProgrammesSearch_1 = __importDefault(require("../../financialAidProgrammes/Programmes/FinancialAidProgrammesSearch"));
const NeedsSearch_1 = __importDefault(require("../../financialAidProgrammes/needs/NeedsSearch"));
const ProtectedRoute_1 = __importDefault(require("../ProtectedRoute"));
const Dashboard_1 = __importDefault(require("./Content/Dashboard/Dashboard"));
const GoodTipToast_1 = require("./Content/Dashboard/GoodTipToast");
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
                const isLoggedIn = await MainControllerReact_1.default.isSessionSet();
                setIsLoggedIn(isLoggedIn);
                if (isLoggedIn)
                    await MainControllerReact_1.default.main();
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(error);
                    setErrorMessage(`${error.message}`);
                }
                return;
            }
            finally {
                setIsReady(true);
            }
        }
        fetchData();
    }, []);
    // Handle the server's response
    async function handleServerResponse(response) {
        if (response.userData) {
            // set current user and ensure repositories are initialized before marking logged in
            MainSetupReact_1.default.currentUser = response.userData;
            try {
                setIsReady(false);
                await MainControllerReact_1.default.main();
                setIsLoggedIn(true);
            }
            catch (err) {
                console.error(err);
                setErrorMessage(err instanceof Error ? err.message : String(err));
            }
            finally {
                setIsReady(true);
            }
        }
        else {
            console.error("Authentication failed:", response.error);
            setErrorMessage(response.errorMessage);
        }
    }
    if (!isReady) {
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "d-flex justify-content-center align-items-center min-vh-100" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)));
    }
    if (!isLoggedIn) {
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "d-flex justify-content-center align-items-center min-vh-100 flex-column" },
            errorMessage && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", className: "mb-3" }, errorMessage)),
            react_1.default.createElement(GoogleLoginButton_1.default, { onServerResponse: handleServerResponse })));
    }
    // zalogowany użytkownik
    return (react_1.default.createElement(react_bootstrap_1.Container, { fluid: true, className: "d-flex flex-column min-vh-100 p-0 bg-white" },
        react_1.default.createElement(AppRoutes, null),
        react_1.default.createElement(Footer_1.default, null)));
}
function AppRoutes() {
    return (react_1.default.createElement(react_router_dom_1.HashRouter, { basename: rootPath },
        react_1.default.createElement(MainMenu_1.default, null),
        react_1.default.createElement(GoodTipToast_1.GoodTipToast, null),
        react_1.default.createElement("div", { className: "mt-3 mb-3" },
            react_1.default.createElement(react_router_dom_1.Routes, null,
                react_1.default.createElement(react_router_dom_1.Route, { path: "/", element: react_1.default.createElement(Dashboard_1.default, null) }),
                react_1.default.createElement(react_router_dom_1.Route, { path: "/letters", element: react_1.default.createElement(LettersSearch_1.default, { title: "Rejestr pism" }) }),
                react_1.default.createElement(react_router_dom_1.Route, { element: react_1.default.createElement(ProtectedRoute_1.default, { allowedRoles: ["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"] }) },
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/contracts", element: react_1.default.createElement(ContractsSearch_1.default, { title: "Rejestr kontraktów" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/contracts/roles", element: react_1.default.createElement(RolesSearch_1.default, { title: "Role kontrakowe" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/contracts/dates", element: react_1.default.createElement(MilestoneDatesSearch_1.default, { title: "Terminy kamieni milowych" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/contracts/znwu", element: react_1.default.createElement(SecuritiesSearch_1.default, { title: "ZNWU ENVI" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/contract/:id", element: react_1.default.createElement(ContractMainViewTabs_1.ContractMainViewTabs, null) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/invoices", element: react_1.default.createElement(InvoicesSearch_1.default, { title: "Rejestr faktur" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/invoice/:id", element: react_1.default.createElement(InvoiceDetails_1.default, null) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/tasksGlobal", element: react_1.default.createElement(TasksGlobal_1.default, null) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/entities", element: react_1.default.createElement(EntitiesSearch_1.default, { title: "Podmioty" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/persons", element: react_1.default.createElement(PersonsSearch_1.default, { title: "Osoby" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/person/:id", element: react_1.default.createElement(PersonProfilePage_1.default, null) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/admin/cities", element: react_1.default.createElement(CitiesSearch_1.default, { title: "Miasta" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/admin/skills", element: react_1.default.createElement(SkillsDictionarySearch_1.default, { title: "S\u0142ownik specjalizacji" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/admin/contractRanges", element: react_1.default.createElement(ContractRangesSearch_1.default, { title: "Zakresy kontratk\u00F3w" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/offers", element: react_1.default.createElement(OffersMainView_1.default, { title: "Oferty" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/offers/list", element: react_1.default.createElement(OffersMainView_1.default, { title: "Oferty" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/offers/letters", element: react_1.default.createElement(LettersSearch_2.default, { title: "Oferty - pisma" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/financialAidProgrammes", element: react_1.default.createElement(FinancialAidProgrammesSearch_1.default, { title: "Programy wsparcia" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/financialAidProgrammes/focusAreas", element: react_1.default.createElement(FocusAreasSearch_1.default, { title: "Dzia\u0142ania" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/financialAidProgrammes/applicationCalls", element: react_1.default.createElement(ApplicationCallsSearch_1.default, { title: "Nabory" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/financialAidProgrammes/needs", element: react_1.default.createElement(NeedsSearch_1.default, { title: "Potrzeby" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/admin/systemUsers", element: react_1.default.createElement(SystemUsersSearch_1.default, { title: "Dodawanie u\u017Cytkownik\u00F3w" }) })),
                react_1.default.createElement(react_router_dom_1.Route, { element: react_1.default.createElement(ProtectedRoute_1.default, { allowedRoles: ["ADMIN", "ENVI_MANAGER"] }) },
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/costInvoices", element: react_1.default.createElement(CostInvoicesSearch_1.default, { title: "Faktury kosztowe" }) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/cost-invoice/:id", element: react_1.default.createElement(CostInvoiceDetails_1.default, null) }),
                    react_1.default.createElement(react_router_dom_1.Route, { path: "/costInvoices/report", element: react_1.default.createElement(CostInvoicesReport_1.default, null) }))))));
}
async function renderApp() {
    const root = document.getElementById("root");
    if (!root)
        return;
    if (MainSetupReact_1.default.isDevEnvironment)
        client_1.default.createRoot(root).render(react_1.default.createElement(google_1.GoogleOAuthProvider, { clientId: MainSetupReact_1.default.CLIENT_ID },
            react_1.default.createElement(react_1.StrictMode, null,
                react_1.default.createElement(App, null))));
    else
        client_1.default.createRoot(root).render(react_1.default.createElement(google_1.GoogleOAuthProvider, { clientId: MainSetupReact_1.default.CLIENT_ID },
            react_1.default.createElement(App, null)));
}
exports.renderApp = renderApp;
renderApp();
