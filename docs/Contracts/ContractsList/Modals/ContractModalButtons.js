"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtherContractAddNewModalButton = exports.OtherContractEditModalButton = exports.OurContractAddNewModalButton = exports.OurContractEditModalButton = exports.ContractEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const ContractsController_1 = require("../ContractsController");
const ContractModalBody_1 = require("./ContractModalBody");
const ContractValidationSchema_1 = require("./ContractValidationSchema");
const OtherContractModalBody_1 = require("./OtherContractModalBody");
const OurContractModalBody_1 = require("./OurContractModalBody");
/** przycisk i modal edycji OurCOntract lub OtherContract */
function ContractEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    return (initialData.ourId
        ? react_1.default.createElement(OurContractEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps })
        : react_1.default.createElement(OtherContractEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps }));
}
exports.ContractEditModalButton = ContractEditModalButton;
function OurContractEditModalButton({ modalProps: { onEdit, initialData, }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OurContractModalBody_1.OurContractModalBody,
            modalTitle: "Edycja umowy",
            repository: ContractsController_1.contractsRepository,
            initialData: initialData,
            makeValidationSchema: ContractValidationSchema_1.ourContractValidationSchema
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.OurContractEditModalButton = OurContractEditModalButton;
function OurContractAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody_1.OurContractModalBody },
            modalTitle: "Nowa umowa ENVI",
            repository: ContractsController_1.contractsRepository,
            makeValidationSchema: ContractValidationSchema_1.ourContractValidationSchema
        }, buttonProps: {
            buttonCaption: "Rejestruj umowę ENVI",
            buttonVariant: "outline-success",
        } }));
}
exports.OurContractAddNewModalButton = OurContractAddNewModalButton;
function OtherContractEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OtherContractModalBody_1.OtherContractModalBody,
            modalTitle: "Edycja umowy",
            repository: ContractsController_1.contractsRepository,
            initialData: initialData,
            makeValidationSchema: ContractValidationSchema_1.otherContractValidationSchema
        }, buttonProps: {} }));
}
exports.OtherContractEditModalButton = OtherContractEditModalButton;
function OtherContractAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: OtherContractModalBody_1.OtherContractModalBody, },
            modalTitle: "Nowa umowa zewnętrzna",
            repository: ContractsController_1.contractsRepository,
            makeValidationSchema: ContractValidationSchema_1.otherContractValidationSchema
        }, buttonProps: {
            buttonCaption: "Rejestruj umowę zewnętrzną",
        } }));
}
exports.OtherContractAddNewModalButton = OtherContractAddNewModalButton;
