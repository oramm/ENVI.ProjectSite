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
exports.ProjectSelectorModalBody = exports.ContractModalBody = void 0;
const react_1 = __importStar(require("react"));
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../View/Modals/FormContext");
const ContractsController_1 = require("../ContractsController");
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const ToolsForms_1 = __importDefault(require("../../../React/ToolsForms"));
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const StatusSelectors_1 = require("../../../View/Modals/CommonFormComponents/StatusSelectors");
function ContractModalBody({ isEditing, initialData }) {
    const { register, setValue, watch, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    const watchAllFields = watch();
    let startDateSugestion;
    let endDateSugestion;
    let guaranteeEndDateSugestion;
    if (isEditing) {
        startDateSugestion = initialData?.startDate;
        endDateSugestion = initialData?.endDate;
        guaranteeEndDateSugestion = initialData?.guaranteeEndDate;
    }
    else {
        startDateSugestion = new Date().toISOString().slice(0, 10);
        endDateSugestion = ToolsDate_1.default.addDays(startDateSugestion, 365).toISOString().slice(0, 10);
        guaranteeEndDateSugestion = ToolsDate_1.default.addDays(endDateSugestion, 365 * 2)
            .toISOString()
            .slice(0, 10);
    }
    (0, react_1.useEffect)(() => {
        setValue("name", initialData?.name || "", { shouldValidate: true });
        setValue("number", initialData?.number || "", { shouldValidate: true });
        setValue("alias", initialData?.alias || "", { shouldValidate: true });
        setValue("comment", initialData?.comment || "", { shouldValidate: true });
        setValue("value", initialData?.value || "", { shouldValidate: true });
        setValue("status", initialData?.status || "", { shouldValidate: true });
        setValue("startDate", startDateSugestion, { shouldValidate: true });
        setValue("endDate", endDateSugestion, { shouldValidate: true });
        setValue("guaranteeEndDate", guaranteeEndDateSugestion, { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "number" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Numer kontraktu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj numer", isInvalid: !!errors?.number, isValid: !errors?.number, ...register("number") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "number" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa kontraktu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, placeholder: "Podaj nazw\u0119", isInvalid: !!errors?.name, isValid: !errors?.name, ...register("name") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "name" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "alias" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Alias"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj alias", isValid: !errors?.alias, isInvalid: !!errors?.alias, ...register("alias") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "alias" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis", isValid: !errors?.comment, isInvalid: !!errors?.comment, ...register("comment") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "comment" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "valueInPLN" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 netto w PLN"),
            react_1.default.createElement(GenericComponents_1.ValueInPLNInput, null)),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "startDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.startDate, isInvalid: !!errors.startDate, ...register("startDate"), className: !isEditing
                        ? ToolsForms_1.default.getSuggestedClass("startDate", watchAllFields, startDateSugestion)
                        : "", onChange: (e) => {
                        register("startDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("endDate");
                    } }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "startDate" })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "endDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.endDate, isInvalid: !!errors.endDate, ...register("endDate"), className: !isEditing ? ToolsForms_1.default.getSuggestedClass("endDate", watchAllFields, endDateSugestion) : "", onChange: (e) => {
                        register("endDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("startDate");
                        trigger("guaranteeEndDate");
                    } }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "endDate" })),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "guaranteeEndDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Gwarancja"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !errors.guaranteeEndDate, isInvalid: !!errors.guaranteeEndDate, ...register("guaranteeEndDate"), className: !isEditing
                        ? ToolsForms_1.default.getSuggestedClass("guaranteeEndDate", watchAllFields, guaranteeEndDateSugestion)
                        : "", onChange: (e) => {
                        register("guaranteeEndDate").onChange(e); // wywołaj standardowe zachowanie
                        //trigger("startDate");
                    } }),
                react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "guaranteeEndDate" }))),
        react_1.default.createElement(StatusSelectors_1.ContractStatusSelectFormElement, null)));
}
exports.ContractModalBody = ContractModalBody;
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Other lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
function ProjectSelectorModalBody({ isEditing, additionalProps }) {
    const { register, setValue, watch, formState } = (0, FormContext_1.useFormContext)();
    const project = watch("_project");
    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody } = additionalProps;
    if (!SpecificContractModalBody)
        throw new Error("SpecificContractModalBody is not defined");
    return (react_1.default.createElement(react_1.default.Fragment, null, project ? (react_1.default.createElement(SpecificContractModalBody, { isEditing: isEditing, additionalProps: additionalProps })) : (react_1.default.createElement(BussinesObjectSelectors_1.ProjectSelector, { repository: ContractsController_1.projectsRepository }))));
}
exports.ProjectSelectorModalBody = ProjectSelectorModalBody;
