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
const ContractsSearch_1 = __importDefault(require("../Contracts/ContractsList/ContractsSearch"));
const CommonComponents_1 = require("../View/Resultsets/CommonComponents");
const ErrorPage_1 = __importDefault(require("./ErrorPage"));
const GoogleLoginButton_1 = __importDefault(require("./GoogleLoginButton"));
const MainControllerReact_1 = __importDefault(require("./MainControllerReact"));
const MainSetupReact_1 = __importDefault(require("./MainSetupReact"));
function App() {
    const [isLoggedIn, setIsLoggedIn] = (0, react_1.useState)(false);
    const [isReady, setIsReady] = (0, react_1.useState)(false);
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    const rootPath = '/envi.projectsite/docs/React/';
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
    const router = (0, react_router_dom_1.createBrowserRouter)([
        {
            path: `/`,
            element: react_1.default.createElement(ContractsSearch_1.default, { title: "Wyszukiwarka kontraktów" }),
            errorElement: react_1.default.createElement(ErrorPage_1.default, null),
        },
        {
            path: `/contract/:id`,
            element: react_1.default.createElement(ContractsSearch_1.default, { title: "test" }),
            errorElement: react_1.default.createElement(ErrorPage_1.default, null),
        }
    ], { basename: rootPath });
    if (errorMessage)
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("h1", null, "Ups! mamy b\u0142\u0105d"),
            react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" },
                " ",
                errorMessage)));
    else if (isReady)
        return (react_1.default.createElement(react_1.default.Fragment, null, isLoggedIn ? (react_1.default.createElement(react_router_dom_1.RouterProvider, { router: router })) : (react_1.default.createElement(GoogleLoginButton_1.default, { onServerResponse: handleServerResponse }))));
    else
        return react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null);
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
