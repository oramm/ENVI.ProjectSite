"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleAddNewModalButton = exports.RoleEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const RolesController_1 = require("../RolesController");
const RoleModalBody_1 = require("./RoleModalBody");
const RoleValidationSchema_1 = require("./RoleValidationSchema");
function RoleEditModalButton({ modalProps: { onEdit, initialData } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: RoleModalBody_1.RoleModalBody,
            modalTitle: "Edycja roli",
            repository: RolesController_1.rolesRepository,
            initialData: initialData,
            makeValidationSchema: RoleValidationSchema_1.makeRoleValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.RoleEditModalButton = RoleEditModalButton;
function RoleAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: RoleModalBody_1.RoleModalBody,
            modalTitle: "Dodaj rolę",
            repository: RolesController_1.rolesRepository,
            makeValidationSchema: RoleValidationSchema_1.makeRoleValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj rolę",
            buttonVariant: "outline-success",
        } }));
}
exports.RoleAddNewModalButton = RoleAddNewModalButton;
