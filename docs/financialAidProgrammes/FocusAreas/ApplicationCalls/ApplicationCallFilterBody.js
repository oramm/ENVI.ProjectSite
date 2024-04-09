"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationCallsFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const FocusAreasController_1 = require("../FocusAreasController");
const FinancialAidProgrammesController_1 = require("../../FinancialAidProgrammesController");
function ApplicationCallsFilterBody() {
    const { register, watch } = (0, FormContext_1.useFormContext)();
    const _financialAidProgramme = watch("_financialAidProgramme");
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 4 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "_financialAidProgramme" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Program wsparcia"),
            react_1.default.createElement(CommonFormComponents_1.FinancialAidProgrammeSelector, { repository: FinancialAidProgrammesController_1.financialAidProgrammesRepository, showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "_focusArea" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Obszar interwencji"),
            react_1.default.createElement(CommonFormComponents_1.FocusAreaSelector, { repository: FocusAreasController_1.focusAreasRepository, _financialAidProgramme: _financialAidProgramme, showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 2, controlId: "status" },
            react_1.default.createElement(CommonFormComponents_1.ApplicationCallStatusSelector, { showValidationInfo: false }))));
}
exports.ApplicationCallsFilterBody = ApplicationCallsFilterBody;
