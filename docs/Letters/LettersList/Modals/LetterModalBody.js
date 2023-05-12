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
exports.ProjectSelectorModalBody = exports.LetterModalBody = void 0;
const react_1 = __importStar(require("react"));
const CommonFormComponents_1 = require("../../../View/Modals/CommonFormComponents");
const react_bootstrap_1 = require("react-bootstrap");
const LettersSearch_1 = require("../LettersSearch");
const FormContext_1 = require("../../../View/Modals/FormContext");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
function LetterModalBody({ isEditing, initialData }) {
    const { register, setValue, watch, formState, trigger } = (0, FormContext_1.useFormContext)();
    const _project = watch('_project');
    const _contract = watch('_contract');
    function getContractFromCases(_cases) {
        if (!_cases || _cases.length === 0)
            return undefined;
        const _contract = LettersSearch_1.contractsRepository;
        return _cases[0]._parent._parent;
    }
    (0, react_1.useEffect)(() => {
        setValue('_contract', getContractFromCases(initialData?._cases), { shouldValidate: true });
        setValue('description', initialData?.description || '', { shouldValidate: true });
        setValue('creationDate', initialData?.creationDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
        setValue('registrationDate', initialData?.registrationDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
        setValue('_editor', initialData?._editor, { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_contract" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Wybierz kontrakt"),
            react_1.default.createElement(CommonFormComponents_1.ContractSelectFormElement, { name: '_contract', repository: LettersSearch_1.contractsRepository, _project: _project, readOnly: !isEditing })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "description" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis", isValid: !formState.errors?.description, isInvalid: !!formState.errors?.description, ...register('description') }),
            formState.errors?.description && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, formState.errors.description.message))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "creationDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data utworzenia"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !formState.errors.creationDate, isInvalid: !!formState.errors.creationDate, ...register('creationDate'), onChange: (e) => {
                        register("creationDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("registrationDate");
                    } }),
                formState.errors.startDate && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, formState.errors.startDate.message))),
            react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col, controlId: "registrationDate" },
                react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data Nadania"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: !formState.errors.registrationDate, isInvalid: !!formState.errors.registrationDate, ...register('registrationDate'), onChange: (e) => {
                        register("registrationDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("creationDate");
                    } }),
                formState.errors.registrationDate && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, formState.errors.registrationDate.message)))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "_editor" },
            react_1.default.createElement(CommonFormComponents_1.PersonSelectFormElement, { label: 'Osoba rejestruj\u0105ca', name: '_editor', repository: MainSetupReact_1.default.personsEnviRepository, required: true })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "file" },
            react_1.default.createElement(CommonFormComponents_1.FileInput, { name: "file", acceptedFileTypes: "application/msword, application/vnd.ms-excel, application/pdf" }))));
}
exports.LetterModalBody = LetterModalBody;
/** przełęcza widok pomiędzy wyborem projektu a formularzem pisma
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
function ProjectSelectorModalBody({ isEditing, additionalProps }) {
    const { register, setValue, watch, formState } = (0, FormContext_1.useFormContext)();
    const project = watch('_project');
    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificLetterModalBody } = additionalProps;
    if (!SpecificLetterModalBody)
        throw new Error("SpecificContractModalBody is not defined");
    return (react_1.default.createElement(react_1.default.Fragment, null, project ? (react_1.default.createElement(SpecificLetterModalBody, { isEditing: isEditing, additionalProps: additionalProps })) : (react_1.default.createElement(CommonFormComponents_1.ProjectSelector, { repository: LettersSearch_1.projectsRepository, required: true, name: '_project' }))));
}
exports.ProjectSelectorModalBody = ProjectSelectorModalBody;
;
