"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityGuarantyAddNewModalButton = exports.SecurityGuarantyAddNewModalButtonGeneric = exports.SecurityCashAddNewModalButton = exports.SecurityCashAddNewModalButtonGeneric = exports.SecurityEditModalButton = exports.SecurityEditModalButtonGeneric = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../../View/Modals/GeneralModalButtons");
const ContractsController_1 = require("../../ContractsController");
const SecurityCashModalBody_1 = require("./SecurityCashModalBody");
const SecurityGuarantyModalBody_1 = require("./SecurityGuarantyModalBody");
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
                ModalBodyComponent: SecurityGuarantyModalBody_1.SecurityGuarantyModalBody,
                modalTitle: "Edycja ZNWU",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: SecurityValidationSchema_1.SecurityGuarantyValidationSchema
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
function SecurityGuarantyAddNewModalButtonGeneric({ modalProps: { onAddNew, repository }, }) {
    if (!repository)
        throw new Error('repository is required');
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: SecurityModalBody_1.ProjectSelectorModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: SecurityGuarantyModalBody_1.SecurityGuarantyModalBody, },
            modalTitle: "Nowa gwarancja ZNWU",
            repository: repository,
            makeValidationSchema: SecurityValidationSchema_1.SecurityGuarantyValidationSchema
        }, buttonProps: {
            buttonCaption: "Dodaj ZNWU",
        } }));
}
exports.SecurityGuarantyAddNewModalButtonGeneric = SecurityGuarantyAddNewModalButtonGeneric;
function SecurityGuarantyAddNewModalButton({ modalProps: { onAddNew }, buttonProps }) {
    return (react_1.default.createElement(SecurityGuarantyAddNewModalButtonGeneric, { modalProps: {
            onAddNew,
            repository: ContractsController_1.securitiesRepository
        }, buttonProps: buttonProps }));
}
exports.SecurityGuarantyAddNewModalButton = SecurityGuarantyAddNewModalButton;
