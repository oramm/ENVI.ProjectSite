"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailsFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const FormContext_1 = require("../../../View/Modals/FormContext");
function MailsFilterBody() {
    const { register } = (0, FormContext_1.useFormContext)();
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 3 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 6, lg: 4, label: "Data wp\u0142ywu", fromName: "incomingDateFrom", toName: "incomingDateTo", showValidationInfo: false, defaultFromValue: MainSetupReact_1.default.OffersInvitationMailFilterInitState.INCOMING_DATE_FROM, defaultToValue: MainSetupReact_1.default.OffersInvitationMailFilterInitState.INCOMING_DATE_TO })));
}
exports.MailsFilterBody = MailsFilterBody;
