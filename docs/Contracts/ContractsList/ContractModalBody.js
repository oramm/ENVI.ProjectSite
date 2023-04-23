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
exports.ContractDeleteModalButton = exports.ContractEditModalButton = exports.ProjectSelectorModalBody = exports.ContractModalBody = void 0;
const react_1 = __importStar(require("react"));
const GeneralModal_1 = require("../../View/GeneralModal");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const react_bootstrap_1 = require("react-bootstrap");
const ContractsController_1 = __importDefault(require("./ContractsController"));
const OurContractModalBody_1 = require("./OurContractModalBody");
const OtherContractModalBody_1 = require("./OtherContractModalBody");
const ContractsSearch_1 = require("./ContractsSearch");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const useValidation_1 = require("../../View/useValidation");
const FormContext_1 = require("../../View/FormContext");
function ContractModalBody({ isEditing, initialData, onValidationChange }) {
    const { register, setValue, watch, formState } = (0, FormContext_1.useFormContext)();
    const [startDate, setStartDate] = (0, react_1.useState)(initialData?.startDate || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = (0, react_1.useState)(initialData?.endDate || new Date().toISOString().slice(0, 10));
    const [isStartDateValid, setIsStartDateValid] = (0, react_1.useState)(initialData?.startDate ? true : false);
    const [isEndDateValid, setIsEndDateValid] = (0, react_1.useState)(initialData?.endDate ? true : false);
    (0, react_1.useEffect)(() => {
        setValue('name', initialData?.name || '', { shouldValidate: true });
        setValue('alias', initialData?.alias || '', { shouldValidate: true });
        setValue('comment', initialData?.comment || '', { shouldValidate: true });
        setValue('value', initialData?.value || '', { shouldValidate: true });
        setValue('status', initialData?.satus || '', { shouldValidate: true });
        setValue('startDate', initialData?.startDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
        setValue('endDate', initialData?.endDate || new Date().toISOString().slice(0, 10), { shouldValidate: true });
        setValue('type', initialData?.type || '', { shouldValidate: true });
        // Ustaw inne wartości domyślne dla pozostałych pól formularza
    }, [initialData, setValue]);
    const aliasValidation = (0, useValidation_1.useValidation)({
        initialValue: initialData?.alias || '',
        validationFunction: (value) => value.length <= 30,
        fieldName: 'alias',
        validationMessage: 'Alias może zawierać maksymalnie 30 znaków.',
        onValidationChange,
    });
    const commentValidation = (0, useValidation_1.useValidation)({
        initialValue: initialData?.comment || '',
        validationFunction: (value) => value.length <= 100,
        fieldName: 'comment',
        validationMessage: 'Komentarz może zawierać maksymalnie 100 znaków.',
        onValidationChange,
    });
    //pozostałe pola:
    const valueInPLNValidation = (0, useValidation_1.useValidation)({
        initialValue: initialData?.value || '',
        validationFunction: (value) => value.length <= 100,
        fieldName: 'value',
        validationMessage: 'Wartość może zawierać maksymalnie 100 znaków.',
        onValidationChange,
    });
    const statusValidation = (0, useValidation_1.useValidation)({
        initialValue: initialData?.status || '',
        validationFunction: (value) => value.length > 0,
        fieldName: 'status',
        validationMessage: 'Status jest wymagany.',
        onValidationChange,
    });
    function datesValidationFunction(value) {
        const { start, end } = { ...value };
        const endDate = new Date(end);
        const startDate = new Date(start);
        return start.length > 0 && end.length > 0 && endDate > startDate;
    }
    const [updateCounter, setUpdateCounter] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        const validationResult = datesValidationFunction({ start: startDate, end: endDate });
        setIsStartDateValid(validationResult);
        setIsEndDateValid(validationResult);
        if (onValidationChange) {
            onValidationChange('startDate', validationResult);
            onValidationChange('endDate', validationResult);
        }
        setUpdateCounter(updateCounter + 1);
    }, [startDate, endDate, onValidationChange, datesValidationFunction, updateCounter, setIsStartDateValid, setIsEndDateValid]);
    (0, react_1.useEffect)(() => {
        if (updateCounter === 0) {
            setStartDate(new Date().toISOString().slice(0, 10));
            setEndDate(new Date().toISOString().slice(0, 10));
        }
    }, [updateCounter]);
    function handleStartDateChange(e) {
        setStartDate(e.target.value);
    }
    ;
    function handleEndDateChange(e) {
        setEndDate(e.target.value);
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
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", name: 'alias', placeholder: "Podaj alias", value: aliasValidation.value, onChange: aliasValidation.handleChange, isInvalid: !aliasValidation.isValid, isValid: aliasValidation.isValid }),
            !aliasValidation.isValid && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, aliasValidation.validationMessage))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", name: "comment", rows: 3, placeholder: "Podaj opis", value: commentValidation.value, onChange: commentValidation.handleChange, isInvalid: !commentValidation.isValid, isValid: commentValidation.isValid }),
            !commentValidation.isValid && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, commentValidation.validationMessage))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "valueInPLN" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 netto w PLN"),
            react_1.default.createElement(CommonComponents_1.ValueInPLNInput, { onChange: valueInPLNValidation.handleChange, value: valueInPLNValidation.value }),
            !valueInPLNValidation.isValid && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, valueInPLNValidation.validationMessage))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "startDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "startDate", value: startDate, onChange: handleStartDateChange, isInvalid: !isStartDateValid, isValid: isStartDateValid }),
            !isStartDateValid && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, "Data zako\u0144czenia musi by\u0107 p\u00F3\u017Aniejsza ni\u017C data rozpocz\u0119cia."))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "endDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "endDate", value: endDate, onChange: handleEndDateChange, isInvalid: !isEndDateValid, isValid: isEndDateValid }),
            !isEndDateValid && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, "Data zako\u0144czenia musi by\u0107 p\u00F3\u017Aniejsza ni\u017C data rozpocz\u0119cia."))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "status" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", isInvalid: !formState.isValid, isValid: formState.isValid, ...register('status', {
                    required: { value: true, message: 'Pole jest wymagane' }
                }) },
                react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
                ContractsController_1.default.statusNames.map((statusName, index) => (react_1.default.createElement("option", { key: index, value: statusName }, statusName)))),
            !formState.isValid && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, formState.errors.status?.message)))));
}
exports.ContractModalBody = ContractModalBody;
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
function ProjectSelectorModalBody({ isEditing, onAdditionalFieldsKeysValuesChange, additionalProps, onValidationChange }) {
    const [projects, setProjects] = (0, react_1.useState)([]);
    const [selected, setSelected] = (0, react_1.useState)(false);
    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody } = additionalProps;
    if (!SpecificContractModalBody)
        throw new Error("SpecificContractModalBody is not defined");
    (0, react_1.useEffect)(() => {
        if (projects.length > 0) {
            const additionalFieldsKeysValues = [
                { name: '_parent', value: JSON.stringify(projects[0]) }
            ];
            if (!onAdditionalFieldsKeysValuesChange)
                throw new Error('OtherContractModalBody:: onAdditionalFieldsKeysValuesChange is not defined');
            onAdditionalFieldsKeysValuesChange(additionalFieldsKeysValues);
        }
    }, [projects, selected]);
    const handleProjectSelection = (currentSelectedItems) => {
        //setProjects(prevProjects => currentSelectedItems);
        setProjects(currentSelectedItems);
        setSelected(currentSelectedItems.length > 0);
    };
    return (react_1.default.createElement(react_1.default.Fragment, null, selected ? (react_1.default.createElement(SpecificContractModalBody, { isEditing: isEditing, additionalProps: additionalProps, onAdditionalFieldsKeysValuesChange: onAdditionalFieldsKeysValuesChange, projectOurId: projects[0].ourId, onValidationChange: onValidationChange })) : (react_1.default.createElement(react_bootstrap_1.Form.Group, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Projekt"),
        react_1.default.createElement(CommonComponents_1.MyAsyncTypeahead, { labelKey: "ourId", repository: ContractsSearch_1.projectsRepository, selectedRepositoryItems: projects, onChange: handleProjectSelection, specialSerwerSearchActionRoute: 'projects/' + MainSetupReact_1.default.currentUser.systemEmail, isRequired: true })))));
}
exports.ProjectSelectorModalBody = ProjectSelectorModalBody;
;
/** przycisk i modal edycji OurCOntract lub OtherContract */
function ContractEditModalButton({ modalProps: { onEdit, onIsReadyChange, initialData }, buttonProps, isOurContract, }) {
    return (isOurContract
        ? react_1.default.createElement(OurContractModalBody_1.OurContractEditModalButton, { modalProps: { onEdit, onIsReadyChange, initialData }, buttonProps: buttonProps })
        : react_1.default.createElement(OtherContractModalBody_1.OtherContractEditModalButton, { modalProps: { onEdit, onIsReadyChange, initialData }, buttonProps: buttonProps }));
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
