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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostInvoiceModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const CostInvoicesController_1 = require("../CostInvoicesController");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
function CostInvoiceModalBody({ isEditing, initialData }) {
    const { register, reset, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            status: initialData?.status || CostInvoicesController_1.CostInvoiceStatuses.NEW,
            isCompanyCost: initialData?.isCompanyCost ?? true,
            isPaid: initialData?.isPaid ?? false,
            paidDate: initialData?.paidDate || null,
            paymentDeadline: initialData?.paymentDeadline || null,
            costCategory: initialData?.costCategory || "",
            comment: initialData?.comment || "",
            _contract: initialData?._contract || null,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { className: "bg-light p-3 rounded mb-3" },
            react_1.default.createElement("h6", null, "Dane faktury z KSeF"),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, { md: 6 },
                    react_1.default.createElement("strong", null, "Numer:"),
                    " ",
                    initialData?.number),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 6 },
                    react_1.default.createElement("strong", null, "Data:"),
                    " ",
                    initialData?.issueDate)),
            react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-2" },
                react_1.default.createElement(react_bootstrap_1.Col, { md: 12 },
                    react_1.default.createElement("strong", null, "Kontrahent:"),
                    " ",
                    initialData?.sellerName,
                    " (NIP: ",
                    initialData?.sellerNip,
                    ")")),
            react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-2" },
                react_1.default.createElement(react_bootstrap_1.Col, { md: 4 },
                    react_1.default.createElement("strong", null, "Netto:"),
                    " ",
                    initialData?.netValue,
                    " z\u0142"),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 4 },
                    react_1.default.createElement("strong", null, "VAT:"),
                    " ",
                    initialData?.vatValue,
                    " z\u0142"),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 4 },
                    react_1.default.createElement("strong", null, "Brutto:"),
                    " ",
                    initialData?.grossValue,
                    " z\u0142")),
            react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-2" },
                react_1.default.createElement(react_bootstrap_1.Col, { md: 12 },
                    react_1.default.createElement("strong", null, "Nr KSeF:"),
                    " ",
                    react_1.default.createElement("code", { className: "small" }, initialData?.ksefNumber)))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "status" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status weryfikacji"),
                react_1.default.createElement(react_bootstrap_1.Form.Select, { isValid: !errors.status, isInvalid: !!errors.status, ...register("status") }, Object.entries(CostInvoicesController_1.CostInvoiceStatuses).map(([key, value]) => (react_1.default.createElement("option", { key: key, value: value }, value)))),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "status" })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "costCategory" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kategoria kosztu"),
                react_1.default.createElement(react_bootstrap_1.Form.Select, { ...register("costCategory") },
                    react_1.default.createElement("option", { value: "" }, "-- Wybierz kategori\u0119 --"),
                    Object.entries(CostInvoicesController_1.CostCategories).map(([key, value]) => (react_1.default.createElement("option", { key: key, value: value }, value)))))),
        react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "isCompanyCost" },
                react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "switch", id: "isCompanyCost", label: "Faktura jest kosztem firmy", ...register("isCompanyCost") }),
                react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" }, "Zaznacz, je\u015Bli faktura ma by\u0107 uwzgl\u0119dniona w kosztach firmy")),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "isPaid" },
                react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "switch", id: "isPaid", label: "Faktura zosta\u0142a zap\u0142acona", ...register("isPaid") }))),
        react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "paymentDeadline" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Termin p\u0142atno\u015Bci"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", ...register("paymentDeadline") })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "paidDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data zap\u0142aty"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", ...register("paidDate") }))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_contract", className: "mt-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Powi\u0105zany kontrakt (opcjonalnie)"),
            react_1.default.createElement(BussinesObjectSelectors_1.ContractSelector, { name: "_contract", typesToInclude: "our", showValidationInfo: false }),
            react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" }, "Mo\u017Cesz powi\u0105za\u0107 faktur\u0119 z kontraktem")),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment", className: "mt-3" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Komentarz / Notatka"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Dodaj komentarz do faktury...", ...register("comment") }))));
}
exports.CostInvoiceModalBody = CostInvoiceModalBody;
