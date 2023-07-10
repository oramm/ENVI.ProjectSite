"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseAddNewModalButton = exports.CaseEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const TasksGlobalController_1 = require("../../TasksGlobalController");
const CaseModalBody_1 = require("./CaseModalBody");
const CaseValidationSchema_1 = require("./CaseValidationSchema");
function CaseEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: CaseModalBody_1.CaseModalBody,
            modalTitle: "Edycja sprawy",
            repository: TasksGlobalController_1.casesRepository,
            initialData: initialData,
            makeValidationSchema: initialData._type.isUniquePerMilestone ?
                CaseValidationSchema_1.makeUniqueCaseValidationSchema : CaseValidationSchema_1.makeMultipleCaseValidationSchema
        }, buttonProps: {
            ...buttonProps,
            buttonVariant: "outline-success",
        } }));
}
exports.CaseEditModalButton = CaseEditModalButton;
function CaseAddNewModalButton({ modalProps: { onAddNew, contextData }, buttonProps }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            contextData,
            ModalBodyComponent: CaseModalBody_1.CaseModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: CaseModalBody_1.CaseModalBody },
            modalTitle: "Nowa sprawa",
            repository: TasksGlobalController_1.casesRepository,
            makeValidationSchema: CaseValidationSchema_1.makeMultipleCaseValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj sprawę",
            buttonVariant: "outline-success",
            ...buttonProps,
        } }));
}
exports.CaseAddNewModalButton = CaseAddNewModalButton;
