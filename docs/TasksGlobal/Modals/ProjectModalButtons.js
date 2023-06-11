"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectAddNewModalButton = exports.ProjectEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../View/Modals/GeneralModalButtons");
const TasksGlobalController_1 = require("../TasksGlobalController");
const ProjectValidationSchema_1 = require("../../Projects/Modals/ProjectValidationSchema");
const ProjectModalBody_1 = require("../../Projects/Modals/ProjectModalBody");
/** przycisk i modal edycji Project */
function ProjectEditModalButton({ modalProps: { onEdit, initialData, }, buttonProps }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: ProjectModalBody_1.ProjectModalBody,
            modalTitle: "Edycja Projektu",
            repository: TasksGlobalController_1.projectsRepository,
            initialData: initialData,
            makeValidationSchema: ProjectValidationSchema_1.makeProjectValidationSchema
        }, buttonProps: {
            ...buttonProps,
            buttonVariant: "outline-success",
        } }));
}
exports.ProjectEditModalButton = ProjectEditModalButton;
function ProjectAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: ProjectModalBody_1.ProjectModalBody,
            modalTitle: "Dodaj projekt",
            repository: TasksGlobalController_1.projectsRepository,
            makeValidationSchema: ProjectValidationSchema_1.makeProjectValidationSchema
        }, buttonProps: {
            buttonCaption: "Dodaj projekt",
            buttonVariant: "outline-success",
        } }));
}
exports.ProjectAddNewModalButton = ProjectAddNewModalButton;
