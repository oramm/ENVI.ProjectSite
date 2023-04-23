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
exports.OurContractAddNewModalButton = exports.OurContractEditModalButton = exports.OurContractModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const ContractModalBody_TEST_1 = require("./ContractModalBody-TEST");
const GeneralModal_1 = require("../../View/GeneralModal");
const ContractsSearch_1 = require("./ContractsSearch");
const useValidation_1 = require("../../View/useValidation");
function OurContractModalBody(props) {
    const initialData = props.initialData;
    const projectOurId = props.projectOurId || initialData?.projectOurId;
    if (!projectOurId)
        throw new Error('OtherContractModalBody:: project is not defined');
    const [selectedAdmins, setSelectedAdmins] = (0, react_1.useState)(initialData?._admin ? [initialData._admin] : []);
    const [selectedManagers, setSelectedManagers] = (0, react_1.useState)(initialData?._manager ? [initialData._manager] : []);
    const [isAdminsValid, setIsAdminValid] = (0, react_1.useState)(initialData?._admin ? true : false);
    const [isManagersValid, setIsManagersValid] = (0, react_1.useState)(initialData?._manager ? true : false);
    const typeValidation = (0, useValidation_1.useValidation)({
        initialValue: initialData?.type,
        validationFunction: (value) => value?.length > 0,
        fieldName: 'type',
        validationMessage: 'Musisz wybrać typ umowy',
        onValidationChange: props.onValidationChange,
    });
    //pozostałe pola admin i managaer
    const managerValidation = (0, useValidation_1.useValidation)({
        initialValue: initialData?._manager ? [initialData._manager] : [],
        validationFunction: (value) => value?.length > 0,
        fieldName: 'manager',
        validationMessage: 'Musisz wybrać koordynatora',
        onValidationChange: props.onValidationChange,
    });
    const adminValidation = (0, useValidation_1.useValidation)({
        initialValue: initialData?._admin ? [initialData._admin] : [],
        validationFunction: (value) => value?.length > 0,
        fieldName: 'admin',
        validationMessage: 'Musisz wybrać administratora',
        onValidationChange: props.onValidationChange,
    });
    (0, react_1.useEffect)(() => {
        const additionalFieldsKeysValues = [
            { name: '_type', value: JSON.stringify(typeValidation.value) },
            { name: '_manager', value: JSON.stringify(managerValidation.value[0]) },
            { name: '_admin', value: JSON.stringify(adminValidation.value[0]) }
        ];
        if (!props.onAdditionalFieldsKeysValuesChange)
            throw new Error('OurContractModalBody: onAdditionalFieldsKeysValuesChange is not defined');
        props.onAdditionalFieldsKeysValuesChange(additionalFieldsKeysValues);
    }, [selectedAdmins, selectedManagers, typeValidation.value, props.onAdditionalFieldsKeysValuesChange]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        (!props.isEditing) ?
            react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(CommonComponents_1.ContractTypeSelectFormElement, { typesToInclude: 'our', 
                    //selectedRepositoryItems={typeValidation.value ? typeValidation.value : []}
                    //onChange={typeValidation.handleChange}
                    isInvalid: !typeValidation.isValid, isValid: typeValidation.isValid }),
                !typeValidation.isValid &&
                    react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, typeValidation.validationMessage))
            : null,
        react_1.default.createElement(ContractModalBody_TEST_1.ContractModalBody, { ...props }),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "manager" },
            react_1.default.createElement(CommonComponents_1.PersonSelectFormElement, { label: 'Koordynator', selectedRepositoryItems: managerValidation.value ? managerValidation.value : [], onChange: managerValidation.handleChange, repository: MainSetupReact_1.default.personsEnviRepository, isInvalid: !managerValidation.isValid, isValid: managerValidation.isValid }),
            !managerValidation.isValid &&
                react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, managerValidation.validationMessage)),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "admin" },
            react_1.default.createElement(CommonComponents_1.PersonSelectFormElement, { label: 'Administrator', selectedRepositoryItems: adminValidation.value ? adminValidation.value : [], onChange: adminValidation.handleChange, repository: MainSetupReact_1.default.personsEnviRepository, isInvalid: !adminValidation.isValid, isValid: adminValidation.isValid }),
            !adminValidation.isValid &&
                react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-danger" }, adminValidation.validationMessage)),
        react_1.default.createElement(CommonComponents_1.FileInput, { fieldName: "exampleFile", acceptedFileTypes: "application/msword, application/vnd.ms-excel, application/pdf" })));
}
exports.OurContractModalBody = OurContractModalBody;
function OurContractEditModalButton({ modalProps: { onEdit, onIsReadyChange, initialData, }, }) {
    return (react_1.default.createElement(GeneralModal_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OurContractModalBody,
            onIsReadyChange: onIsReadyChange,
            modalTitle: "Edycja umowy",
            repository: ContractsSearch_1.contractsRepository,
            initialData: initialData,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.OurContractEditModalButton = OurContractEditModalButton;
function OurContractAddNewModalButton({ modalProps: { onAddNew, onIsReadyChange }, }) {
    return (react_1.default.createElement(GeneralModal_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            onIsReadyChange: onIsReadyChange,
            ModalBodyComponent: ContractModalBody_TEST_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody },
            modalTitle: "Nowa umowa ENVI",
            repository: ContractsSearch_1.contractsRepository,
        }, buttonProps: {
            buttonCaption: "Rejestruj umowę ENVI",
            buttonVariant: "outline-success",
        } }));
}
exports.OurContractAddNewModalButton = OurContractAddNewModalButton;
