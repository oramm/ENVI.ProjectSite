"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingEditModalButton = MeetingEditModalButton;
exports.MeetingAddNewModalButton = MeetingAddNewModalButton;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../../../View/Modals/GeneralModalButtons");
const ContractsController_1 = require("../../../ContractsController");
const MeetingModalBody_1 = require("./MeetingModalBody");
const MeetingValidationSchema_1 = require("./MeetingValidationSchema");
const ContractDetailsContext_1 = require("../../ContractDetailsContext");
function MeetingEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit,
            ModalBodyComponent: MeetingModalBody_1.MeetingModalBody,
            modalTitle: 'Edycja spotkania',
            repository: ContractsController_1.meetingsRepository,
            initialData,
            makeValidationSchema: MeetingValidationSchema_1.makeMeetingValidationSchema,
        }, buttonProps: { ...buttonProps, buttonVariant: 'outline-success' } }));
}
function MeetingAddNewModalButton({ modalProps: { onAddNew }, }) {
    const { contract } = (0, ContractDetailsContext_1.useContractDetails)();
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew,
            ModalBodyComponent: MeetingModalBody_1.MeetingModalBody,
            modalTitle: 'Dodaj spotkanie',
            repository: ContractsController_1.meetingsRepository,
            makeValidationSchema: MeetingValidationSchema_1.makeMeetingValidationSchema,
            contextData: contract?.id,
        }, buttonProps: {
            buttonCaption: 'Dodaj spotkanie',
            buttonVariant: 'outline-success',
        } }));
}
