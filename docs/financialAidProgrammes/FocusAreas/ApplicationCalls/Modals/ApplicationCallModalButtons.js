"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationCallAddNewModalButton = exports.ApplicationCallEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../../View/Modals/GeneralModalButtons");
const ApplicationCallModalBody_1 = require("./ApplicationCallModalBody");
const ApplicationCallValidationSchema_1 = require("../ApplicationCallValidationSchema");
const ApplicationCallsController_1 = require("../ApplicationCallsController");
function ApplicationCallEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: ApplicationCallModalBody_1.ApplicationCallModalBody,
            modalTitle: "Edycja wywołania aplikacji",
            repository: ApplicationCallsController_1.applicationCallsRepository,
            initialData: initialData,
            makeValidationSchema: ApplicationCallValidationSchema_1.makeApplicationCallValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.ApplicationCallEditModalButton = ApplicationCallEditModalButton;
function ApplicationCallAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ApplicationCallModalBody_1.ApplicationCallModalBody,
            modalTitle: "Dodaj wywołanie aplikacji",
            repository: ApplicationCallsController_1.applicationCallsRepository,
            makeValidationSchema: ApplicationCallValidationSchema_1.makeApplicationCallValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj wywołanie",
            buttonVariant: "outline-success",
        } }));
}
exports.ApplicationCallAddNewModalButton = ApplicationCallAddNewModalButton;
