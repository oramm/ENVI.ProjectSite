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
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const ContractModalBody_1 = require("./ContractModalBody");
const GeneralModal_1 = require("../../../View/GeneralModal");
const ContractsSearch_1 = require("../ContractsSearch");
const FormContext_1 = require("../../../View/FormContext");
const ContractValidationSchema_1 = require("./ContractValidationSchema");
function OurContractModalBody(props) {
    const initialData = props.initialData;
    const { register, setValue, watch, formState, control } = (0, FormContext_1.useFormContext)();
    const _type = watch('_type');
    (0, react_1.useEffect)(() => {
        setValue('_manager', initialData?._manager, { shouldValidate: true });
    }, [initialData, setValue]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(CommonComponents_1.PersonSelectFormElement, { label: 'Koordynator', name: '_manager', repository: MainSetupReact_1.default.personsEnviRepository, required: true })));
}
exports.OurContractModalBody = OurContractModalBody;
function OurContractEditModalButton({ modalProps: { onEdit, initialData, }, }) {
    return (react_1.default.createElement(GeneralModal_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OurContractModalBody,
            modalTitle: "Edycja umowy",
            repository: ContractsSearch_1.contractsRepository,
            initialData: initialData,
            validationSchema: ContractValidationSchema_1.ourContractValidationSchema
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.OurContractEditModalButton = OurContractEditModalButton;
function OurContractAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModal_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody },
            modalTitle: "Nowa umowa ENVI",
            repository: ContractsSearch_1.contractsRepository,
            validationSchema: ContractValidationSchema_1.ourContractValidationSchema
        }, buttonProps: {
            buttonCaption: "Rejestruj umowę ENVI",
            buttonVariant: "outline-success",
        } }));
}
exports.OurContractAddNewModalButton = OurContractAddNewModalButton;