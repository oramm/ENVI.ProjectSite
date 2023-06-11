"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskAddNewModalButton = exports.TaskEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const TaskValidationSchema_1 = require("./TaskValidationSchema");
const GeneralModalButtons_1 = require("../../../../../View/Modals/GeneralModalButtons");
const TaskModalBody_1 = require("./TaskModalBody");
const ContractsController_1 = require("../../../ContractsController");
/** przycisk i modal edycji Task */
function TaskEditModalButton({ modalProps: { onEdit, initialData, }, buttonProps }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: TaskModalBody_1.TaskModalBody,
            modalTitle: "Edycja zadania",
            repository: ContractsController_1.tasksRepository,
            initialData: initialData,
            makeValidationSchema: TaskValidationSchema_1.makeTaskValidationSchema
        }, buttonProps: {
            ...buttonProps,
            buttonVariant: "outline-success",
        } }));
}
exports.TaskEditModalButton = TaskEditModalButton;
function TaskAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: TaskModalBody_1.TaskModalBody,
            modalTitle: "Dodaj zadanie",
            repository: ContractsController_1.tasksRepository,
            makeValidationSchema: TaskValidationSchema_1.makeTaskValidationSchema
        }, buttonProps: {
            buttonCaption: "Dodaj zadanie",
            buttonVariant: "outline-success",
        } }));
}
exports.TaskAddNewModalButton = TaskAddNewModalButton;
