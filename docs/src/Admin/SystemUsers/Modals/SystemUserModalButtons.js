"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemUserAddNewModalButton = exports.SystemUserEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const SystemUserController_1 = require("../SystemUserController");
const SystemUserModalBody_1 = require("./SystemUserModalBody");
const SystemUserValidationSchema_1 = require("./SystemUserValidationSchema");
function SystemUserEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: SystemUserModalBody_1.SystemUserModalBody,
            modalTitle: "Edycja danych osoby",
            repository: SystemUserController_1.systemUserRepository,
            initialData: initialData,
            makeValidationSchema: SystemUserValidationSchema_1.makeSystemUserValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.SystemUserEditModalButton = SystemUserEditModalButton;
function SystemUserAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: SystemUserModalBody_1.SystemUserModalBody,
            modalTitle: "Dodaj użytkownika systemu",
            repository: SystemUserController_1.systemUserRepository,
            makeValidationSchema: SystemUserValidationSchema_1.makeSystemUserValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj użytkownika",
            buttonVariant: "outline-success",
        } }));
}
exports.SystemUserAddNewModalButton = SystemUserAddNewModalButton;
