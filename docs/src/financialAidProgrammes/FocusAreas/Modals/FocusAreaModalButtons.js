"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusAreaAddNewModalButton = exports.FocusAreaEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const FocusAreaModalBody_1 = require("./FocusAreaModalBody");
const FocusAreaValidationSchema_1 = require("../FocusAreaValidationSchema");
const FocusAreasController_1 = require("../FocusAreasController");
function FocusAreaEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: FocusAreaModalBody_1.FocusAreaModalBody,
            modalTitle: "Edycja działania",
            repository: FocusAreasController_1.focusAreasRepository,
            initialData: initialData,
            makeValidationSchema: FocusAreaValidationSchema_1.makeFocusAreaValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.FocusAreaEditModalButton = FocusAreaEditModalButton;
function FocusAreaAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: FocusAreaModalBody_1.FocusAreaModalBody,
            modalTitle: "Dodaj działanie",
            repository: FocusAreasController_1.focusAreasRepository,
            makeValidationSchema: FocusAreaValidationSchema_1.makeFocusAreaValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj działanie",
            buttonVariant: "outline-success",
        } }));
}
exports.FocusAreaAddNewModalButton = FocusAreaAddNewModalButton;
