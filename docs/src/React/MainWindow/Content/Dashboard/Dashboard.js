"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MyData_1 = __importDefault(require("./MyData"));
//import News from "../News";
const OffersCard_1 = __importDefault(require("./OffersCard"));
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
const InvoicesCard_1 = __importDefault(require("./InvoicesCard"));
const ApplicationCallsCard_1 = __importDefault(require("./ApplicationCallsCard"));
const MilestonesCard_1 = __importDefault(require("./MilestonesCard"));
function Dashboard() {
    const currentUser = MainSetupReact_1.default.currentUserOrNull;
    if (!currentUser) {
        return (react_1.default.createElement(react_bootstrap_1.Row, { className: "mx-3" },
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info", className: "mb-0" }, "Trwa pobieranie danych u\u017Cytkownika. Widok zostanie za\u0142adowany po potwierdzeniu sesji."))));
    }
    return (react_1.default.createElement(react_bootstrap_1.Row, { className: "mx-3" },
        react_1.default.createElement(react_bootstrap_1.Col, { md: 3, className: "mb-3" },
            react_1.default.createElement(OffersCard_1.default, { className: "mb-3 bg-white" }),
            ["ADMIN", "ENVI_MANAGER"].includes(currentUser.systemRoleName) && (react_1.default.createElement(InvoicesCard_1.default, { className: "mb-3 bg-white" })),
            react_1.default.createElement(ApplicationCallsCard_1.default, { className: "mb-3 bg-white" })),
        react_1.default.createElement(react_bootstrap_1.Col, { md: 6, className: "mb-3" },
            react_1.default.createElement(MilestonesCard_1.default, null)),
        react_1.default.createElement(react_bootstrap_1.Col, { md: 3, className: "mb-3" },
            react_1.default.createElement(MyData_1.default, { className: "mb-3 bg-white" }))));
}
