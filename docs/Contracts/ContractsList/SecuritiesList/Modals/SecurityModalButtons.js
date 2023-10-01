"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityGuaranteeAddNewModalButton = exports.SecurityGuaranteeAddNewModalButtonGeneric = exports.SecurityCashAddNewModalButton = exports.SecurityCashAddNewModalButtonGeneric = exports.SecurityEditModalButton = exports.SecurityEditModalButtonGeneric = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../../View/Modals/GeneralModalButtons");
const ContractsController_1 = require("../../ContractsController");
const SecurityCashModalBody_1 = require("./SecurityCashModalBody");
const SecurityGuaranteeModalBody_1 = require("./SecurityGuaranteeModalBody");
const SecurityModalBody_1 = require("./SecurityModalBody");
const SecurityValidationSchema_1 = require("./SecurityValidationSchema");
/** przycisk i modal edycji SecurityCash */
function SecurityEditModalButtonGeneric({ modalProps: { onEdit, initialData, repository }, buttonProps, }) {
    if (!repository)
        throw new Error('repository is required');
    return (initialData.gdFolderId
        ? react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
                onEdit: onEdit,
                ModalBodyComponent: SecurityCashModalBody_1.SecurityCashModalBody,
                modalTitle: "Edycja ZNWU",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: SecurityValidationSchema_1.securityCashValidationSchema
            }, buttonProps: {
                ...buttonProps,
                buttonVariant: "outline-success",
            } })
        : react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
                onEdit: onEdit,
                ModalBodyComponent: SecurityGuaranteeModalBody_1.SecurityGuaranteeModalBody,
                modalTitle: "Edycja ZNWU",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: SecurityValidationSchema_1.SecurityGuaranteeValidationSchema
            }, buttonProps: { ...buttonProps } }));
}
exports.SecurityEditModalButtonGeneric = SecurityEditModalButtonGeneric;
function SecurityEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    return (react_1.default.createElement(SecurityEditModalButtonGeneric, { modalProps: {
            onEdit,
            initialData,
            repository: ContractsController_1.securitiesRepository
        }, buttonProps: buttonProps }));
}
exports.SecurityEditModalButton = SecurityEditModalButton;
function SecurityCashAddNewModalButtonGeneric({ modalProps: { onAddNew, repository }, buttonProps }) {
    if (!repository)
        throw new Error('repository is required');
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: SecurityModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: SecurityCashModalBody_1.SecurityCashModalBody },
            modalTitle: "Nowe ZNWU - gotówka",
            repository: repository,
            makeValidationSchema: SecurityValidationSchema_1.securityCashValidationSchema
        }, buttonProps: {
            buttonCaption: "Dodaj ZNWU - gotówka",
            buttonVariant: "outline-success",
            ...buttonProps,
        } }));
}
exports.SecurityCashAddNewModalButtonGeneric = SecurityCashAddNewModalButtonGeneric;
function SecurityCashAddNewModalButton({ modalProps: { onAddNew }, buttonProps }) {
    return (react_1.default.createElement(SecurityCashAddNewModalButtonGeneric, { modalProps: {
            onAddNew,
            repository: ContractsController_1.securitiesRepository
        }, buttonProps: buttonProps }));
}
exports.SecurityCashAddNewModalButton = SecurityCashAddNewModalButton;
function SecurityGuaranteeAddNewModalButtonGeneric({ modalProps: { onAddNew, repository }, }) {
    if (!repository)
        throw new Error('repository is required');
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: SecurityModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: SecurityGuaranteeModalBody_1.SecurityGuaranteeModalBody, },
            modalTitle: "Nowa gwarancja ZNWU",
            repository: repository,
            makeValidationSchema: SecurityValidationSchema_1.SecurityGuaranteeValidationSchema
        }, buttonProps: {
            buttonCaption: "Dodaj ZNWU",
        } }));
}
exports.SecurityGuaranteeAddNewModalButtonGeneric = SecurityGuaranteeAddNewModalButtonGeneric;
function SecurityGuaranteeAddNewModalButton({ modalProps: { onAddNew }, buttonProps }) {
    return (react_1.default.createElement(SecurityGuaranteeAddNewModalButtonGeneric, { modalProps: {
            onAddNew,
            repository: ContractsController_1.securitiesRepository
        }, buttonProps: buttonProps }));
}
exports.SecurityGuaranteeAddNewModalButton = SecurityGuaranteeAddNewModalButton;
