"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeedsFilterBody = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../View/Modals/FormContext");
const BussinesObjectSelectors_1 = require("../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const FinancialAidProgrammesController_1 = require("../FinancialAidProgrammesController");
const ApplicationCallsController_1 = require("../FocusAreas/ApplicationCalls/ApplicationCallsController");
const FocusAreasController_1 = require("../FocusAreas/FocusAreasController");
const GenericComponents_1 = require("../../View/Modals/CommonFormComponents/GenericComponents");
function NeedsFilterBody() {
    const { register, formState: { errors }, watch, } = (0, FormContext_1.useFormContext)();
    const _focusAreas = watch("_focusArea");
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 4 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Szukana fraza"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Wpisz tekst", ...register("searchText") })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 8 },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Klient"),
            react_1.default.createElement(GenericComponents_1.MyAsyncTypeahead, { name: "_client", labelKey: "name", repository: FinancialAidProgrammesController_1.clientsRepository, showValidationInfo: false }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "_client" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "_financialAidProgramme" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Program wsparcia"),
            react_1.default.createElement(BussinesObjectSelectors_1.FinancialAidProgrammeSelector, { repository: FinancialAidProgrammesController_1.financialAidProgrammesRepository, showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "_focusArea" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Dzia\u0142anie"),
            react_1.default.createElement(BussinesObjectSelectors_1.FocusAreaSelector, { repository: FocusAreasController_1.focusAreasRepository, showValidationInfo: false })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, md: 6, controlId: "_applicationCall" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nab\u00F3r"),
            react_1.default.createElement(BussinesObjectSelectors_1.ApplicationCallSelector, { repository: ApplicationCallsController_1.applicationCallsRepository, showValidationInfo: false, _focusArea: _focusAreas }))));
}
exports.NeedsFilterBody = NeedsFilterBody;
