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
exports.ApplicationCallModalBody = void 0;
const react_1 = __importStar(require("react"));
const BussinesObjectSelectors_1 = require("../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../../View/Modals/FormContext");
const FocusAreasController_1 = require("../../FocusAreasController");
const FinancialAidProgrammesController_1 = require("../../../FinancialAidProgrammesController");
const StatusSelectors_1 = require("../../../../View/Modals/CommonFormComponents/StatusSelectors");
const GenericComponents_1 = require("../../../../View/Modals/CommonFormComponents/GenericComponents");
function ApplicationCallModalBody({ isEditing, initialData }) {
    const { register, reset, formState: { errors }, trigger, watch, } = (0, FormContext_1.useFormContext)();
    const _financialAidProgramme = watch("_financialAidProgramme");
    (0, react_1.useEffect)(() => {
        const resetData = {
            _focusArea: initialData?._focusArea,
            description: initialData?.description,
            url: initialData?.url,
            startDate: initialData?.startDate,
            endDate: initialData?.endDate,
            status: initialData?.status,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset, trigger]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        !isEditing && (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_financialAidProgramme" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Program wsparcia"),
            react_1.default.createElement(BussinesObjectSelectors_1.FinancialAidProgrammeSelector, { repository: FinancialAidProgrammesController_1.financialAidProgrammesRepository, showValidationInfo: true }))),
        _financialAidProgramme && (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_focusArea" },
            react_1.default.createElement(BussinesObjectSelectors_1.FocusAreaSelectorPrefilled, { repository: FocusAreasController_1.focusAreasRepository, _financialAidProgramme: _financialAidProgramme, showValidationInfo: true }))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis", isValid: !errors?.description, isInvalid: !!errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "description", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "url" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "URL"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj URL", isValid: !errors.url, isInvalid: !!errors?.url, ...register("url") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "url", errors: errors })),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "startDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data rozpocz\u0119cia"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.startDate, isInvalid: !!errors?.startDate, ...register("startDate") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "startDate", errors: errors })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "endDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data zako\u0144czenia"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.endDate, isInvalid: !!errors?.endDate, ...register("endDate") }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { name: "endDate", errors: errors }))),
        react_1.default.createElement(StatusSelectors_1.ApplicationCallStatusSelector, { showValidationInfo: true })));
}
exports.ApplicationCallModalBody = ApplicationCallModalBody;
