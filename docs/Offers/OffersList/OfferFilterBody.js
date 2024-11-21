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
exports.OffersFilterBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const StatusSelectors_1 = require("../../View/Modals/CommonFormComponents/StatusSelectors");
const GenericComponents_1 = require("../../View/Modals/CommonFormComponents/GenericComponents");
function OffersFilterBody() {
    const { reset, register, setValue, watch, trigger } = (0, FormContext_1.useFormContext)();
    (0, react_1.useEffect)(() => {
        const resetData = {
            searchText: "",
            statuses: MainSetupReact_1.default.OffersFilterInitState.STATUSES,
            submissionDeadlineFrom: MainSetupReact_1.default.OffersFilterInitState.SUBMISSION_FROM,
            submissionDeadlineTo: MainSetupReact_1.default.OffersFilterInitState.SUBMISSION_TO,
        };
        reset(resetData);
        trigger();
    }, []);
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 3 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(GenericComponents_1.DateRangeInput, { as: react_bootstrap_1.Col, sm: 12, md: 6, lg: 4, label: "Termin sk\u0142adania", fromName: "submissionDeadlineFrom", toName: "submissionDeadlineTo", showValidationInfo: false }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 2 },
            react_1.default.createElement(StatusSelectors_1.OfferStatusSelector, { multiple: true, showValidationInfo: false, label: "Status oferty" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 2 },
            react_1.default.createElement(StatusSelectors_1.OfferBondStatusSelector, { name: "offerBondStatuses", label: "Status wadium", showValidationInfo: false, multiple: true }))));
}
exports.OffersFilterBody = OffersFilterBody;
