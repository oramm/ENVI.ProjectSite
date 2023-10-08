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
exports.OtherContractAddNewModalButton = exports.OtherContractAddNewModalButtonGeneric = exports.OurContractAddNewModalButton = exports.OurContractAddNewModalButtonGeneric = exports.ContractPartialEditTrigger = exports.ContractEditModalButton = exports.ContractEditModalButtonGeneric = void 0;
const react_1 = __importStar(require("react"));
const GeneralModal_1 = require("../../../View/Modals/GeneralModal");
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const ContractsController_1 = require("../ContractsController");
const ContractModalBody_1 = require("./ContractModalBody");
const ContractValidationSchema_1 = require("./ContractValidationSchema");
const OtherContractModalBody_1 = require("./OtherContractModalBody");
const OurContractModalBody_1 = require("./OurContractModalBody");
/** przycisk i modal edycji OurCOntract lub OtherContract */
function ContractEditModalButtonGeneric({ modalProps: { onEdit, initialData, repository }, buttonProps, }) {
    if (!repository)
        throw new Error('repository is required');
    return (initialData.ourId
        ? react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
                onEdit: onEdit,
                ModalBodyComponent: OurContractModalBody_1.OurContractModalBody,
                modalTitle: "Edycja umowy",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: ContractValidationSchema_1.ourContractValidationSchema
            }, buttonProps: {
                ...buttonProps,
                buttonVariant: "outline-success",
            } })
        : react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
                onEdit: onEdit,
                ModalBodyComponent: OtherContractModalBody_1.OtherContractModalBody,
                modalTitle: "Edycja umowy",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: ContractValidationSchema_1.otherContractValidationSchema
            }, buttonProps: { ...buttonProps } }));
}
exports.ContractEditModalButtonGeneric = ContractEditModalButtonGeneric;
function ContractEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    return (react_1.default.createElement(ContractEditModalButtonGeneric, { modalProps: {
            onEdit,
            initialData,
            repository: ContractsController_1.contractsRepository
        }, buttonProps: buttonProps }));
}
exports.ContractEditModalButton = ContractEditModalButton;
function ContractPartialEditTrigger({ modalProps: { onEdit, specialActionRoute, ModalBodyComponent, additionalModalBodyProps, modalTitle, initialData, repository, makeValidationSchema, fieldsToUpdate, }, children }) {
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    function handleOpen() {
        setShowForm(true);
    }
    function handleClose() {
        setShowForm(false);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("span", { onClick: handleOpen, style: { cursor: 'pointer' } }, children),
        react_1.default.createElement(GeneralModal_1.GeneralModal, { onClose: handleClose, show: showForm, isEditing: true, title: modalTitle, repository: repository, onEdit: onEdit, specialActionRoute: specialActionRoute, ModalBodyComponent: ModalBodyComponent, makeValidationSchema: makeValidationSchema, modalBodyProps: {
                isEditing: true,
                initialData: initialData,
                additionalProps: additionalModalBodyProps,
            }, fieldsToUpdate: fieldsToUpdate })));
}
exports.ContractPartialEditTrigger = ContractPartialEditTrigger;
function OurContractAddNewModalButtonGeneric({ modalProps: { onAddNew, repository }, buttonProps }) {
    if (!repository)
        throw new Error('repository is required');
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody_1.OurContractModalBody },
            modalTitle: "Nowa umowa ENVI",
            repository: repository,
            makeValidationSchema: ContractValidationSchema_1.ourContractValidationSchema
        }, buttonProps: {
            buttonCaption: "Rejestruj umowę ENVI",
            buttonVariant: "outline-success",
            ...buttonProps,
        } }));
}
exports.OurContractAddNewModalButtonGeneric = OurContractAddNewModalButtonGeneric;
function OurContractAddNewModalButton({ modalProps: { onAddNew }, buttonProps }) {
    return (react_1.default.createElement(OurContractAddNewModalButtonGeneric, { modalProps: {
            onAddNew,
            repository: ContractsController_1.contractsRepository
        }, buttonProps: buttonProps }));
}
exports.OurContractAddNewModalButton = OurContractAddNewModalButton;
function OtherContractAddNewModalButtonGeneric({ modalProps: { onAddNew, repository }, }) {
    if (!repository)
        throw new Error('repository is required');
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ContractModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: OtherContractModalBody_1.OtherContractModalBody, },
            modalTitle: "Nowa umowa zewnętrzna",
            repository: repository,
            makeValidationSchema: ContractValidationSchema_1.otherContractValidationSchema
        }, buttonProps: {
            buttonCaption: "Rejestruj umowę zewnętrzną",
        } }));
}
exports.OtherContractAddNewModalButtonGeneric = OtherContractAddNewModalButtonGeneric;
function OtherContractAddNewModalButton({ modalProps: { onAddNew }, buttonProps }) {
    return (react_1.default.createElement(OtherContractAddNewModalButtonGeneric, { modalProps: {
            onAddNew,
            repository: ContractsController_1.contractsRepository
        }, buttonProps: buttonProps }));
}
exports.OtherContractAddNewModalButton = OtherContractAddNewModalButton;
