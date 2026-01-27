"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostInvoicesFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const GenericComponents_1 = require("../../View/Modals/CommonFormComponents/GenericComponents");
const CostInvoicesController_1 = require("./CostInvoicesController");
function CostInvoicesFilterBody() {
    const { register } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 4 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 4, label: "Data faktury", fromName: "issueDateFrom", toName: "issueDateTo", showValidationInfo: false }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(react_bootstrap_1.Form.Select, { ...register("status") },
                react_1.default.createElement("option", { value: "" }, "Wszystkie"),
                Object.entries(CostInvoicesController_1.CostInvoiceStatuses).map(([key, value]) => (react_1.default.createElement("option", { key: key, value: value }, value))))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kategoria kosztu"),
            react_1.default.createElement(react_bootstrap_1.Form.Select, { ...register("costCategory") },
                react_1.default.createElement("option", { value: "" }, "Wszystkie"),
                Object.entries(CostInvoicesController_1.CostCategories).map(([key, value]) => (react_1.default.createElement("option", { key: key, value: value }, value))))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 3, className: "mt-2" },
            react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", label: "Tylko do koszt\u00F3w", ...register("onlyCompanyCosts") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 3, className: "mt-2" },
            react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", label: "Tylko niezap\u0142acone", ...register("onlyUnpaid") }))));
}
exports.CostInvoicesFilterBody = CostInvoicesFilterBody;
