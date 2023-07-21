"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskAddNewModalButton = exports.TaskEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const TaskGlobalModalBody_1 = require("./TaskGlobalModalBody");
const GeneralModalButtons_1 = require("../../View/Modals/GeneralModalButtons");
const TaskGlobalValidationSchema_1 = require("./TaskGlobalValidationSchema");
const TasksGlobalController_1 = require("../TasksGlobalController");
/** przycisk i modal edycji Task */
function TaskEditModalButton({ modalProps: { onEdit, initialData, }, buttonProps }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: TaskGlobalModalBody_1.TaskGlobalModalBody,
            modalTitle: "Edycja zadania",
            repository: TasksGlobalController_1.tasksRepository,
            initialData: initialData,
            makeValidationSchema: TaskGlobalValidationSchema_1.makeTaskGlobalValidationSchema
        }, buttonProps: {
            ...buttonProps,
            buttonVariant: "outline-success",
        } }));
}
exports.TaskEditModalButton = TaskEditModalButton;
function TaskAddNewModalButton({ modalProps: { onAddNew, contextData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: TaskGlobalModalBody_1.TaskGlobalModalBody,
            contextData,
            modalTitle: "Dodaj zadanie",
            repository: TasksGlobalController_1.tasksRepository,
            makeValidationSchema: TaskGlobalValidationSchema_1.makeTaskGlobalValidationSchema
        }, buttonProps: {
            buttonCaption: "Dodaj zadanie",
            buttonVariant: "outline-success",
        } }));
}
exports.TaskAddNewModalButton = TaskAddNewModalButton;
