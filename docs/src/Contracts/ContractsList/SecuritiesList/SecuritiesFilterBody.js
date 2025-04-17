"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecuritiesFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const FormContext_1 = require("../../../View/Modals/FormContext");
const ContractsController_1 = require("../ContractsController");
const StatusSelectors_1 = require("../../../View/Modals/CommonFormComponents/StatusSelectors");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
function SecuritiesFilterBody() {
    const { register } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 2 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 5 },
            react_1.default.createElement(BussinesObjectSelectors_1.ProjectSelector, { repository: ContractsController_1.projectsRepository, showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, xl: 5 },
            react_1.default.createElement(BussinesObjectSelectors_1.ContractTypeSelectFormElement, { name: "_contractType", showValidationInfo: false })),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 6, lg: 4, label: "Rozpocz\u0119cie", fromName: "startDateFrom", toName: "startDateTo", showValidationInfo: false, defaultFromValue: MainSetupReact_1.default.SecuritiesFilterInitState.START_DATE_FROM, defaultToValue: MainSetupReact_1.default.SecuritiesFilterInitState.START_DATE_TO }),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 6, lg: 4, label: "70% wygasa", fromName: "firstPartExpiryDateFrom", toName: "firstPartExpiryDateTo", showValidationInfo: false, defaultFromValue: MainSetupReact_1.default.SecuritiesFilterInitState.FIRST_PART_EXPIRY_DATE_FROM }),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 6, lg: 4, label: "30% wygasa", fromName: "secondPartExpiryDateFrom", toName: "secondPartExpiryDateTo", showValidationInfo: false, defaultFromValue: MainSetupReact_1.default.SecuritiesFilterInitState.SECOND_PART_EXPIRY_DATE_FROM }),
        react_1.default.createElement(StatusSelectors_1.SecurityStatusSelector, { name: "status", showValidationInfo: false })));
}
exports.SecuritiesFilterBody = SecuritiesFilterBody;
