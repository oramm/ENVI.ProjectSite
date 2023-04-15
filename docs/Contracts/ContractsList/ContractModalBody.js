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
function ContractModalBody({ isEditing, initialData, onValidationChange }) {
    const [name, setName] = (0, react_1.useState)(initialData?.name || '');
    const [alias, setAlias] = (0, react_1.useState)(initialData?.alias || '');
    const [comment, setComment] = (0, react_1.useState)(initialData?.comment || '');
    const [valueInPLN, setValueInPLN] = (0, react_1.useState)(initialData?.value || '');
    const [status, setStatus] = (0, react_1.useState)(initialData?.status || '');
    const [startDate, setStartDate] = (0, react_1.useState)(initialData?.startDate || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = (0, react_1.useState)(initialData?.endDate || new Date().toISOString().slice(0, 10));
    const [isNameValid, setIsNameValid] = (0, react_1.useState)(initialData?.name ? true : false);
    const [isAliasValid, setIsAliasValid] = (0, react_1.useState)(initialData?.alias ? true : false);
    const [isCommentValid, setIsCommentValid] = (0, react_1.useState)(initialData?.comment ? true : false);
    const [isValueInPLNValid, setIsValueInPLNValid] = (0, react_1.useState)(initialData?.value ? true : false);
    const [isStatusValid, setIsStatusValid] = (0, react_1.useState)(initialData?.status ? true : false);
    const [isStartDateValid, setIsStartDateValid] = (0, react_1.useState)(initialData?.startDate ? true : false);
    const [isEndDateValid, setIsEndDateValid] = (0, react_1.useState)(initialData?.endDate ? true : false);
    function handleNameChange(e) {
        const value = e.target.value;
        const validationFormula = value.length >= 3 && value.length <= 50;
        setName(value);
        setIsNameValid(validationFormula);
        if (onValidationChange)
            onValidationChange('name', validationFormula);
    }
    ;
    function handleAliasChange(e) {
        const value = e.target.value;
        const validationFormula = value.length <= 30;
        setAlias(value);
        setIsAliasValid(validationFormula);
        if (onValidationChange)
            onValidationChange('alias', validationFormula);
    }
    ;
    //dodaj hadnleCHange dla pozostałych pól:
    function handleCommentChange(e) {
        const value = e.target.value;
        const validationFormula = value.length <= 100;
        setComment(value);
        setIsCommentValid(validationFormula);
        if (onValidationChange)
            onValidationChange('comment', validationFormula);
    }
    ;
    function handleValueInPLNChange(value) {
        const validationFormula = value.length <= 100;
        setValueInPLN(value);
        setIsValueInPLNValid(validationFormula);
        if (onValidationChange)
            onValidationChange('value', validationFormula);
    }
    ;
    function handleStatusChange(e) {
        const value = e.target.value;
        const validationFormula = value.length > 0;
        setStatus(value);
        setIsStatusValid(validationFormula);
        if (onValidationChange)
            onValidationChange('status', validationFormula);
    }
    ;
    function handleStartDateChange(e) {
        const value = e.target.value;
        const endDate = new Date(value);
        const start = new Date(startDate);
        const validationFormula = value.length > 0 && endDate >= start;
        setStartDate(value);
        setIsStartDateValid(validationFormula);
        setIsEndDateValid(validationFormula);
        if (onValidationChange) {
            onValidationChange('startDate', validationFormula);
            onValidationChange('endDate', validationFormula);
        }
    }
    ;
    function handleEndDateChange(e) {
        const value = e.target.value;
        const endDate = new Date(value);
        const start = new Date(startDate);
        const validationFormula = value.length > 0 && endDate >= start;
        setEndDate(value);
        setIsEndDateValid(validationFormula);
        setIsStartDateValid(validationFormula);
        if (onValidationChange) {
            onValidationChange('endDate', validationFormula);
            onValidationChange('startDate', validationFormula);
        }
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "name" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nazwa kontraktu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", name: "name", placeholder: "Podaj nazw\u0119", value: name, onChange: handleNameChange, isInvalid: !isNameValid, isValid: isNameValid }),
            !isNameValid && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, "Nazwa musi zawiera\u0107 od 3 do 50 znak\u00F3w."))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "alias" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Alias"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", name: 'alias', placeholder: "Podaj alias", value: alias, onChange: handleAliasChange, isInvalid: !isAliasValid, isValid: isAliasValid })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "comment" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Opis"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", name: "comment", rows: 3, placeholder: "Podaj opis", value: comment, onChange: handleCommentChange, isInvalid: !isCommentValid, isValid: isCommentValid })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "valueInPLN" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Warto\u015B\u0107 netto w PLN"),
            react_1.default.createElement(CommonComponents_1.ValueInPLNInput, { onChange: handleValueInPLNChange, value: valueInPLN })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "startDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Pocz\u0105tek"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "startDate", value: startDate, onChange: handleStartDateChange, isInvalid: !isStartDateValid, isValid: isStartDateValid })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "endDate" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Zako\u0144czenie"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", name: "endDate", value: endDate, onChange: handleEndDateChange, isInvalid: !isEndDateValid, isValid: isEndDateValid })),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "status" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", name: "status", onChange: handleStatusChange, value: status, isInvalid: !isStatusValid, isValid: isStatusValid },
                react_1.default.createElement("option", { value: "" }, "-- Wybierz opcj\u0119 --"),
                ContractsController_1.default.statusNames.map((statusName, index) => (react_1.default.createElement("option", { key: index, value: statusName }, statusName)))))));
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
