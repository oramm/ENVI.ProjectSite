"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestoneAddNewModalButton = exports.MilestoneEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const TasksGlobalController_1 = require("../../TasksGlobalController");
const MilestoneModalBody_1 = require("./MilestoneModalBody");
const MilestoneValidationSchema_1 = require("./MilestoneValidationSchema");
function MilestoneEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: MilestoneModalBody_1.ContractMilestoneModalBody,
            modalTitle: "Edycja kamienia milowego",
            repository: TasksGlobalController_1.milestonesRepository,
            initialData: initialData,
            makeValidationSchema: MilestoneValidationSchema_1.makeMilestoneValidationSchema,
        }, buttonProps: {
            ...buttonProps,
            buttonVariant: "outline-success",
        } }));
}
exports.MilestoneEditModalButton = MilestoneEditModalButton;
function MilestoneAddNewModalButton({ modalProps: { onAddNew, contextData }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            contextData,
            ModalBodyComponent: MilestoneModalBody_1.ContractMilestoneModalBody,
            additionalModalBodyProps: { SpecificContractModalBody: MilestoneModalBody_1.ContractMilestoneModalBody },
            modalTitle: "Nowy kamień milowy",
            repository: TasksGlobalController_1.milestonesRepository,
            makeValidationSchema: MilestoneValidationSchema_1.makeMilestoneValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj kamień milowy",
            buttonVariant: "outline-success",
            ...buttonProps,
        } }));
}
exports.MilestoneAddNewModalButton = MilestoneAddNewModalButton;
