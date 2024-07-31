"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffersFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const StatusSelectors_1 = require("../../View/Modals/CommonFormComponents/StatusSelectors");
const GenericComponents_1 = require("../../View/Modals/CommonFormComponents/GenericComponents");
function OffersFilterBody() {
    const { register } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 3 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 6, lg: 4, label: "Termin sk\u0142adania", fromName: "submissionDeadlineFrom", toName: "submissionDeadlineTo", showValidationInfo: false, defaultFromValue: MainSetupReact_1.default.OffersFilterInitState.SUBMISSION_FROM, defaultToValue: MainSetupReact_1.default.OffersFilterInitState.SUBMISSION_TO }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 2 },
            react_1.default.createElement(StatusSelectors_1.OfferStatusSelector, { showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 2 },
            react_1.default.createElement(StatusSelectors_1.OfferBondStatusSelector, { showValidationInfo: false, name: "_offerBond.status" }))));
}
exports.OffersFilterBody = OffersFilterBody;
