"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExperienceEditModalButton = createExperienceEditModalButton;
exports.createExperienceAddNewModalButton = createExperienceAddNewModalButton;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const ExperienceModalBody_1 = require("./ExperienceModalBody");
const ExperienceValidationSchema_1 = require("./ExperienceValidationSchema");
function createExperienceEditModalButton(repository) {
    return function ExperienceEditModalButton({ modalProps: { onEdit, initialData } }) {
        return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
                onEdit: onEdit,
                ModalBodyComponent: ExperienceModalBody_1.ExperienceModalBody,
                modalTitle: "Edycja doświadczenia",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: ExperienceValidationSchema_1.makeExperienceValidationSchema,
            }, buttonProps: {
                buttonVariant: "outline-success",
            } }));
    };
}
function createExperienceAddNewModalButton(repository) {
    return function ExperienceAddNewModalButton({ modalProps: { onAddNew } }) {
        return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
                onAddNew: onAddNew,
                ModalBodyComponent: ExperienceModalBody_1.ExperienceModalBody,
                modalTitle: "Dodaj doświadczenie",
                repository: repository,
                makeValidationSchema: ExperienceValidationSchema_1.makeExperienceValidationSchema,
            }, buttonProps: {
                buttonCaption: "Dodaj doświadczenie",
                buttonVariant: "outline-success",
            } }));
    };
}
