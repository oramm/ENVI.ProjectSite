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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostInvoicesFilterBody = CostInvoicesFilterBody;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const GenericComponents_1 = require("../../View/Modals/CommonFormComponents/GenericComponents");
const CostInvoicesController_1 = require("./CostInvoicesController");
const costInvoicePaymentFilters_1 = require("./costInvoicePaymentFilters");
function CostInvoicesFilterBody() {
    const { register } = (0, FormContext_1.useFormContext)();
    const [categories, setCategories] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        (0, CostInvoicesController_1.fetchCategories)().then(setCategories).catch(console.error);
    }, []);
    return (react_1.default.createElement(react_bootstrap_1.Row, { className: "g-3 cost-invoices-filter-grid" },
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 4 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Nr faktury, dostawca", ...register("searchText") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "NIP dostawcy"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "NIP", ...register("supplierNip") })),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 6, label: "Data faktury", fromName: "dateFrom", toName: "dateTo", showValidationInfo: false }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 4 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kategoria"),
            react_1.default.createElement(react_bootstrap_1.Form.Select, { ...register("categoryId") },
                react_1.default.createElement("option", { value: "" }, "Wszystkie kategorie"),
                categories.map((cat) => (react_1.default.createElement("option", { key: cat.id, value: cat.id }, cat.name))))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(react_bootstrap_1.Form.Select, { ...register("status") },
                react_1.default.createElement("option", { value: "" }, "Wszystkie"),
                Object.entries(CostInvoicesController_1.CostInvoiceStatuses).map(([key, value]) => (react_1.default.createElement("option", { key: key, value: value }, value === "NEW"
                    ? "Nowa"
                    : value === "EXCLUDED"
                        ? "Poza kosztami"
                        : value === "BOOKED"
                            ? "Zaksięgowana"
                            : value))))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 3 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Stan platnosci"),
            react_1.default.createElement(react_bootstrap_1.Form.Select, { ...register("paymentStatus") },
                react_1.default.createElement("option", { value: "" }, "Wszystkie"),
                costInvoicePaymentFilters_1.paymentStatusFilterOptions.map(({ value, label }) => (react_1.default.createElement("option", { key: value, value: value }, label))))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 3 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Forma platnosci"),
            react_1.default.createElement(react_bootstrap_1.Form.Select, { ...register("paymentMethod") },
                react_1.default.createElement("option", { value: "" }, "Wszystkie"),
                costInvoicePaymentFilters_1.paymentMethodFilterOptions.map(({ value, label }) => (react_1.default.createElement("option", { key: value, value: value }, label)))))));
}
