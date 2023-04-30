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
exports.ContractDeleteModalButton = exports.ContractEditModalButton = exports.ProjectSelectorModalBody = exports.ContractModalBody = void 0;
const react_1 = __importStar(require("react"));
const GeneralModal_1 = require("../../../View/GeneralModal");
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const react_bootstrap_1 = require("react-bootstrap");
const OurContractModalBody_1 = require("./OurContractModalBody");
const OtherContractModalBody_1 = require("./OtherContractModalBody");
const ContractsSearch_1 = require("../ContractsSearch");
const FormContext_1 = require("../../../View/FormContext");
function ContractModalBody({ isEditing, initialData, onValidationChange }) {
    const { register, setValue, watch, formState } = (0, FormContext_1.useFormContext)();
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    const [dateValidationResult, setDateValidationResult] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        setValue('name', initialData?.name || '', { shouldValidate: true });
        setValue('alias', initialData?.alias || '', { shouldValidate: true });
        setValue('comment', initialData?.comment || '', { shouldValidate: true });
        setValue('value', initialData?.value || '', { shouldValidate: true });
        setValue('status', initialData?.satus || '', { shouldValidate: true });
        setValue('startDate', initialData?.startDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
        setValue('endDate', initialData?.endDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
    }, [initialData, setValue]);
    (0, react_1.useEffect)(() => {
        if (!startDate || !endDate)
            return;
        const validationMessage = datesValidationFunction();
        setDateValidationResult(validationMessage);
    }, [startDate, endDate]);
    function datesValidationFunction() {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end)
            return 'Początek musi być wcześniejszy niż zakończenie';
        return '';
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa kontraktu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj nazw\u0119", isInvalid: !!formState.errors?.name, isValid: !formState.errors?.name, ...register('name', {
                    required: { value: true, message: 'Nazwa jest wymagana' },
                    minLength: { value: 3, message: 'Nazwa musi mieć przynajmniej 3 znaki' },
                    maxLength: { value: 50, message: 'Nazwa może mieć maksymalnie 50 znaków' }
                }) }),
            formState.errors?.name && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, formState.errors.name.message))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "alias" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Alias"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj alias", isValid: !formState.errors?.alias, isInvalid: !!formState.errors?.alias, ...register('alias') }),
            formState.errors?.alias && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, formState.errors.alias.message))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 3, placeholder: "Podaj opis", isValid: !formState.errors?.comment, isInvalid: !!formState.errors?.comment, ...register('comment', {
                    required: false,
                    maxLength: { value: 50, message: 'Opis może mieć maksymalnie 50 znaków' }
                }) }),
            formState.errors?.comment && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, formState.errors.comment.message))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "valueInPLN" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 netto w PLN"),
            react_1.default.createElement(CommonComponents_1.ValueInPLNInput, { required: true })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "startDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: dateValidationResult === '', isInvalid: dateValidationResult !== '', ...register('startDate') }),
            dateValidationResult && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, dateValidationResult))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "endDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", isValid: dateValidationResult === '', isInvalid: dateValidationResult !== '', ...register('endDate') }),
            dateValidationResult && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, dateValidationResult))),
        react_1.default.createElement(CommonComponents_1.ContractStatus, { required: true })));
}
exports.ContractModalBody = ContractModalBody;
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
function ProjectSelectorModalBody({ isEditing, additionalProps, onValidationChange }) {
    const { register, setValue, watch, formState } = (0, FormContext_1.useFormContext)();
    const project = watch('_parent');
    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody } = additionalProps;
    if (!SpecificContractModalBody)
        throw new Error("SpecificContractModalBody is not defined");
    return (react_1.default.createElement(react_1.default.Fragment, null, project ? (react_1.default.createElement(SpecificContractModalBody, { isEditing: isEditing, additionalProps: additionalProps, onValidationChange: onValidationChange })) : (react_1.default.createElement(CommonComponents_1.ProjectSelector, { repository: ContractsSearch_1.projectsRepository, required: true }))));
}
exports.ProjectSelectorModalBody = ProjectSelectorModalBody;
;
/** przycisk i modal edycji OurCOntract lub OtherContract */
function ContractEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, isOurContract, }) {
    return (isOurContract
        ? react_1.default.createElement(OurContractModalBody_1.OurContractEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps })
        : react_1.default.createElement(OtherContractModalBody_1.OtherContractEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps }));
}
exports.ContractEditModalButton = ContractEditModalButton;
function ContractDeleteModalButton({ modalProps: { onDelete } }) {
    const currentContract = ContractsSearch_1.contractsRepository.currentItems[0];
    const modalTitle = 'Usuwanie kontraktu ' + (currentContract?.ourId || currentContract?._number || '');
    return (react_1.default.createElement(GeneralModal_1.GeneralDeleteModalButton, { modalProps: {
            onDelete,
            modalTitle,
            repository: ContractsSearch_1.contractsRepository,
            initialData: ContractsSearch_1.contractsRepository.currentItems[0],
        } }));
}
exports.ContractDeleteModalButton = ContractDeleteModalButton;
