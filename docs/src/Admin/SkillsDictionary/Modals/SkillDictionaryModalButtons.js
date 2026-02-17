"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillDictionaryAddNewModalButton = exports.SkillDictionaryEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const SkillsDictionaryController_1 = require("../SkillsDictionaryController");
const SkillDictionaryModalBody_1 = require("./SkillDictionaryModalBody");
const SkillDictionaryValidationSchema_1 = require("./SkillDictionaryValidationSchema");
function SkillDictionaryEditModalButton({ modalProps: { onEdit, initialData } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: SkillDictionaryModalBody_1.SkillDictionaryModalBody,
            modalTitle: "Edycja specjalizacji",
            repository: SkillsDictionaryController_1.skillsDictionaryRepository,
            initialData: initialData,
            makeValidationSchema: SkillDictionaryValidationSchema_1.makeSkillDictionaryValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.SkillDictionaryEditModalButton = SkillDictionaryEditModalButton;
function SkillDictionaryAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: SkillDictionaryModalBody_1.SkillDictionaryModalBody,
            modalTitle: "Dodaj specjalizację",
            repository: SkillsDictionaryController_1.skillsDictionaryRepository,
            makeValidationSchema: SkillDictionaryValidationSchema_1.makeSkillDictionaryValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj specjalizację",
            buttonVariant: "outline-success",
        } }));
}
exports.SkillDictionaryAddNewModalButton = SkillDictionaryAddNewModalButton;
