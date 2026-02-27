"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingNoteEditModalButton = MeetingNoteEditModalButton;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../../../View/Modals/GeneralModalButtons");
const ContractsController_1 = require("../../../ContractsController");
const MeetingNoteModalBody_1 = require("./MeetingNoteModalBody");
const MeetingNoteValidationSchema_1 = require("./MeetingNoteValidationSchema");
function MeetingNoteEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit,
            ModalBodyComponent: MeetingNoteModalBody_1.MeetingNoteModalBody,
            modalTitle: 'Edycja notatki ze spotkania',
            repository: ContractsController_1.meetingNotesRepository,
            initialData,
            makeValidationSchema: MeetingNoteValidationSchema_1.makeMeetingNoteValidationSchema,
        }, buttonProps: { ...buttonProps, buttonVariant: 'outline-success' } }));
}
