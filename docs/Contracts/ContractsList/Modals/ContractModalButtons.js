"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtherContractAddNewModalButton = exports.OtherContractAddNewModalButtonGeneric = exports.OurContractAddNewModalButton = exports.OurContractAddNewModalButtonGeneric = exports.ContractEditModalButton = exports.ContractEditModalButtonGeneric = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const ContractsController_1 = require("../ContractsController");
const ContractModalBody_1 = require("./ContractModalBody");
const ContractValidationSchema_1 = require("./ContractValidationSchema");
const OtherContractModalBody_1 = require("./OtherContractModalBody");
const OurContractModalBody_1 = require("./OurContractModalBody");
/** przycisk i modal edycji OurCOntract lub OtherContract */
function ContractEditModalButtonGeneric({ modalProps: { onEdit, initialData, repository, shouldRetrieveDataBeforeEdit }, buttonProps, }) {
    if (!repository)
        throw new Error("repository is required");
    return `ourId` in initialData ? (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OurContractModalBody_1.OurContractModalBody,
            modalTitle: "Edycja umowy",
            repository: repository,
            initialData: initialData,
            makeValidationSchema: ContractValidationSchema_1.ourContractValidationSchema,
            shouldRetrieveDataBeforeEdit,
        }, buttonProps: {
            ...buttonProps,
            buttonVariant: "outline-success",
        } })) : (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OtherContractModalBody_1.OtherContractModalBody,
            modalTitle: "Edycja umowy",
            repository: repository,
            initialData: initialData,
            makeValidationSchema: ContractValidationSchema_1.otherContractValidationSchema,
        }, buttonProps: { ...buttonProps } }));
}
exports.ContractEditModalButtonGeneric = ContractEditModalButtonGeneric;
function ContractEditModalButton({ modalProps: { onEdit, initialData, shouldRetrieveDataBeforeEdit }, buttonProps, }) {
    return (react_1.default.createElement(ContractEditModalButtonGeneric, { modalProps: {
            onEdit,
            initialData,
            repository: ContractsController_1.contractsRepository,
            shouldRetrieveDataBeforeEdit,
        }, buttonProps: buttonProps }));
}
exports.ContractEditModalButton = ContractEditModalButton;
function OurContractAddNewModalButtonGeneric({ modalProps: { onAddNew, repository }, buttonProps, }) {
    if (!repository)
        throw new Error("repository is required");
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody_1.OurContractModalBody },
            modalTitle: "Nowa umowa ENVI",
            repository: repository,
            makeValidationSchema: ContractValidationSchema_1.ourContractValidationSchema,
        }, buttonProps: {
            buttonCaption: "Rejestruj umowę ENVI",
            buttonVariant: "outline-success",
            ...buttonProps,
        } }));
}
exports.OurContractAddNewModalButtonGeneric = OurContractAddNewModalButtonGeneric;
function OurContractAddNewModalButton({ modalProps: { onAddNew }, buttonProps, }) {
    return (react_1.default.createElement(OurContractAddNewModalButtonGeneric, { modalProps: {
            onAddNew,
            repository: ContractsController_1.contractsRepository,
        }, buttonProps: buttonProps }));
}
exports.OurContractAddNewModalButton = OurContractAddNewModalButton;
function OtherContractAddNewModalButtonGeneric({ modalProps: { onAddNew, repository }, }) {
    if (!repository)
        throw new Error("repository is required");
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: OtherContractModalBody_1.OtherContractModalBody },
            modalTitle: "Nowa umowa zewnętrzna",
            repository: repository,
            makeValidationSchema: ContractValidationSchema_1.otherContractValidationSchema,
        }, buttonProps: {
            buttonCaption: "Rejestruj umowę zewnętrzną",
        } }));
}
exports.OtherContractAddNewModalButtonGeneric = OtherContractAddNewModalButtonGeneric;
function OtherContractAddNewModalButton({ modalProps: { onAddNew }, buttonProps, }) {
    return (react_1.default.createElement(OtherContractAddNewModalButtonGeneric, { modalProps: {
            onAddNew,
            repository: ContractsController_1.contractsRepository,
        }, buttonProps: buttonProps }));
}
exports.OtherContractAddNewModalButton = OtherContractAddNewModalButton;
