"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfileSkillEditModalButton = createProfileSkillEditModalButton;
exports.createProfileSkillAddNewModalButton = createProfileSkillAddNewModalButton;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const ProfileSkillModalBody_1 = require("./ProfileSkillModalBody");
const ProfileSkillValidationSchema_1 = require("./ProfileSkillValidationSchema");
function createProfileSkillEditModalButton(repository) {
    return function ProfileSkillEditModalButton({ modalProps: { onEdit, initialData } }) {
        return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
                onEdit: onEdit,
                ModalBodyComponent: ProfileSkillModalBody_1.ProfileSkillModalBody,
                modalTitle: "Edycja specjalizacji",
                repository: repository,
                initialData: initialData,
                makeValidationSchema: ProfileSkillValidationSchema_1.makeProfileSkillValidationSchema,
            }, buttonProps: {
                buttonVariant: "outline-success",
            } }));
    };
}
function createProfileSkillAddNewModalButton(repository) {
    return function ProfileSkillAddNewModalButton({ modalProps: { onAddNew } }) {
        return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
                onAddNew: onAddNew,
                ModalBodyComponent: ProfileSkillModalBody_1.ProfileSkillModalBody,
                modalTitle: "Dodaj specjalizację",
                repository: repository,
                makeValidationSchema: ProfileSkillValidationSchema_1.makeProfileSkillValidationSchema,
            }, buttonProps: {
                buttonCaption: "Dodaj specjalizację",
                buttonVariant: "outline-success",
            } }));
    };
}
