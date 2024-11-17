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
exports.ProjectSelectorModalBody = exports.SecurityModalBody = void 0;
const react_1 = __importStar(require("react"));
const BussinesObjectSelectors_1 = require("../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../../../../View/Modals/FormContext");
const ContractsController_1 = require("../../ContractsController");
const GenericComponents_1 = require("../../../../View/Modals/CommonFormComponents/GenericComponents");
const StatusSelectors_1 = require("../../../../View/Modals/CommonFormComponents/StatusSelectors");
function SecurityModalBody({ isEditing, initialData }) {
    const { register, reset, watch, formState: { errors }, trigger, } = (0, FormContext_1.useFormContext)();
    const _project = watch("_project");
    (0, react_1.useEffect)(() => {
        const resetData = {
            _contract: initialData?._contract,
            description: initialData?.description || "",
            value: initialData?.value || "",
            returnedValue: initialData?.returnedValue || "",
            status: initialData?.status || "",
        };
        if (!isEditing)
            resetData._project = _project;
        reset(resetData);
        trigger();
    }, [initialData, reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        !isEditing && (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_contract" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wybierz kontrakt"),
            react_1.default.createElement(BussinesObjectSelectors_1.ContractSelectFormElement, { name: "_contract", typesToInclude: "our", repository: ContractsController_1.contractsRepository, _project: _project, readOnly: !isEditing }))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis", isValid: !errors?.description, isInvalid: !!errors?.description, ...register("description") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "description" })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "valueInPLN" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107"),
            react_1.default.createElement(GenericComponents_1.ValueInPLNInput, null)),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "returnedValue" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zwr\u00F3cono"),
            react_1.default.createElement(GenericComponents_1.ValueInPLNInput, { name: "returnedValue" })),
        react_1.default.createElement(StatusSelectors_1.SecurityStatusSelector, { name: "status", showValidationInfo: true })));
}
exports.SecurityModalBody = SecurityModalBody;
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
function ProjectSelectorModalBody({ isEditing, additionalProps }) {
    const { register, setValue, watch, formState, reset, trigger } = (0, FormContext_1.useFormContext)();
    const project = watch("_project");
    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody: SpecificModalBody } = additionalProps;
    if (!SpecificModalBody)
        throw new Error("SpecificContractModalBody is not defined");
    (0, react_1.useEffect)(() => {
        reset({ _project: undefined });
        trigger();
    }, [reset]);
    return (react_1.default.createElement(react_1.default.Fragment, null, project ? (react_1.default.createElement(SpecificModalBody, { isEditing: isEditing, additionalProps: additionalProps })) : (react_1.default.createElement(BussinesObjectSelectors_1.ProjectSelector, { repository: ContractsController_1.projectsRepository, name: "_project" }))));
}
exports.ProjectSelectorModalBody = ProjectSelectorModalBody;
