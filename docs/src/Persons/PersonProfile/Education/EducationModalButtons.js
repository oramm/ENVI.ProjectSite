"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEducationAddNewModalButton = exports.createEducationEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const EducationModalBody_1 = require("./EducationModalBody");
const EducationValidationSchema_1 = require("./EducationValidationSchema");
function createEducationEditModalButton(repository) {
    return function EducationEditModalButton({ modalProps: { onEdit, initialData } }) {
        return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
                onEdit: onEdit,
                ModalBodyComponent: EducationModalBody_1.EducationModalBody,
                modalTitle: "Edycja wykształcenia",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: EducationValidationSchema_1.makeEducationValidationSchema,
            }, buttonProps: {
                buttonVariant: "outline-success",
            } }));
    };
}
exports.createEducationEditModalButton = createEducationEditModalButton;
function createEducationAddNewModalButton(repository) {
    return function EducationAddNewModalButton({ modalProps: { onAddNew } }) {
        return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
                onAddNew: onAddNew,
                ModalBodyComponent: EducationModalBody_1.EducationModalBody,
                modalTitle: "Dodaj wykształcenie",
                repository: repository,
                makeValidationSchema: EducationValidationSchema_1.makeEducationValidationSchema,
            }, buttonProps: {
                buttonCaption: "Dodaj wykształcenie",
                buttonVariant: "outline-success",
            } }));
    };
}
exports.createEducationAddNewModalButton = createEducationAddNewModalButton;
