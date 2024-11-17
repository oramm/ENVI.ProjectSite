"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const BussinesObjectSelectors_1 = require("../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const InvoicesController_1 = require("./InvoicesController");
const StatusSelectors_1 = require("../../View/Modals/CommonFormComponents/StatusSelectors");
const GenericComponents_1 = require("../../View/Modals/CommonFormComponents/GenericComponents");
function InvoicesFilterBody() {
    const { register } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 5 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 7, label: "Data utworzenia", fromName: "issueDateFrom", toName: "issueDateTo", showValidationInfo: false, defaultFromValue: MainSetupReact_1.default.InvoicesFilterInitState.ISSUE_DATE_FROM, defaultToValue: MainSetupReact_1.default.InvoicesFilterInitState.ISSUE_DATE_TO }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 8 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kontrakt"),
            react_1.default.createElement(BussinesObjectSelectors_1.ContractSelectFormElement, { repository: InvoicesController_1.contractsRepository, name: "_contract", typesToInclude: "our", showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, sm: 12, md: 4 },
            react_1.default.createElement(StatusSelectors_1.InvoiceStatusSelector, { multiple: true, showValidationInfo: false }))));
}
exports.InvoicesFilterBody = InvoicesFilterBody;
