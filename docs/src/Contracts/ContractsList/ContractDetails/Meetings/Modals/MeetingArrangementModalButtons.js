"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingArrangementEditModalButton = MeetingArrangementEditModalButton;
exports.MeetingArrangementAddNewModalButton = MeetingArrangementAddNewModalButton;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../../../View/Modals/GeneralModalButtons");
const ContractsController_1 = require("../../../ContractsController");
const MeetingArrangementModalBody_1 = require("./MeetingArrangementModalBody");
const MeetingArrangementValidationSchema_1 = require("./MeetingArrangementValidationSchema");
function MeetingArrangementEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit,
            ModalBodyComponent: MeetingArrangementModalBody_1.MeetingArrangementModalBody,
            modalTitle: 'Edycja punktu agendy',
            repository: ContractsController_1.meetingArrangementsRepository,
            initialData,
            makeValidationSchema: MeetingArrangementValidationSchema_1.makeMeetingArrangementValidationSchema,
        }, buttonProps: { ...buttonProps, buttonVariant: 'outline-success' } }));
}
function MeetingArrangementAddNewModalButton({ modalProps: { onAddNew }, contextData, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew,
            ModalBodyComponent: MeetingArrangementModalBody_1.MeetingArrangementModalBody,
            modalTitle: 'Dodaj punkt agendy',
            repository: ContractsController_1.meetingArrangementsRepository,
            makeValidationSchema: MeetingArrangementValidationSchema_1.makeMeetingArrangementValidationSchema,
            contextData,
        }, buttonProps: {
            buttonCaption: 'Dodaj punkt agendy',
            buttonVariant: 'outline-success',
        } }));
}
