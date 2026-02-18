"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingNoteAddNewModalButton = MeetingNoteAddNewModalButton;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../../../View/Modals/GeneralModalButtons");
const MeetingNoteModalBody_1 = require("./MeetingNoteModalBody");
const ContractsController_1 = require("../../../ContractsController");
const MeetingNoteValidationSchema_1 = require("./MeetingNoteValidationSchema");
const ContractDetailsContext_1 = require("../../ContractDetailsContext");
function MeetingNoteAddNewModalButton({ modalProps: { onAddNew }, }) {
    const { contract } = (0, ContractDetailsContext_1.useContractDetails)();
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: MeetingNoteModalBody_1.MeetingNoteModalBody,
            modalTitle: "Dodaj notatkę ze spotkania",
            repository: ContractsController_1.meetingNotesRepository,
            makeValidationSchema: MeetingNoteValidationSchema_1.makeMeetingNoteValidationSchema,
            contextData: contract?.id,
        }, buttonProps: {
            buttonCaption: "Dodaj notatkę",
            buttonVariant: "outline-success",
        } }));
}
