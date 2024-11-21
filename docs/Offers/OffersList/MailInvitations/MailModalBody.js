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
exports.MailModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
function MailModalBody({ isEditing, initialData }) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger, } = (0, FormContext_1.useFormContext)();
    const submissionDeadlineFrom = watch("submissionDeadlineFrom");
    const submissionDeadlineTo = watch("submissionDeadlineTo");
    (0, react_1.useEffect)(() => {
        const resetData = {
            searchText: "",
            incomingDateFrom: MainSetupReact_1.default.OffersInvitationMailFilterInitState.INCOMING_DATE_FROM,
            incomingDateTo: MainSetupReact_1.default.OffersInvitationMailFilterInitState.INCOMING_DATE_TO,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 3 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 6, lg: 4, label: "Termin sk\u0142adania", fromName: "incomingDateFrom", toName: "incomingDateTo", showValidationInfo: false, defaultFromValue: MainSetupReact_1.default.OffersInvitationMailFilterInitState.INCOMING_DATE_FROM, defaultToValue: MainSetupReact_1.default.OffersInvitationMailFilterInitState.INCOMING_DATE_TO })));
}
exports.MailModalBody = MailModalBody;
