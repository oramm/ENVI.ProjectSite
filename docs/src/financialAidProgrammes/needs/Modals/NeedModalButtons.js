"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeedAddNewModalButton = exports.NeedEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const NeedModalBody_1 = require("./NeedModalBody");
const NeedValidationSchema_1 = require("../NeedValidationSchema");
const FinancialAidProgrammesController_1 = require("../../FinancialAidProgrammesController");
function NeedEditModalButton({ modalProps: { onEdit, initialData, shouldRetrieveDataBeforeEdit }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: NeedModalBody_1.NeedModalBody,
            modalTitle: "Edycja potrzeby",
            repository: FinancialAidProgrammesController_1.needsRepository,
            initialData: initialData,
            makeValidationSchema: NeedValidationSchema_1.makeNeedValidationSchema,
            shouldRetrieveDataBeforeEdit,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.NeedEditModalButton = NeedEditModalButton;
function NeedAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: NeedModalBody_1.NeedModalBody,
            modalTitle: "Dodaj potrzebę",
            repository: FinancialAidProgrammesController_1.needsRepository,
            makeValidationSchema: NeedValidationSchema_1.makeNeedValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj potrzebę",
            buttonVariant: "outline-success",
        } }));
}
exports.NeedAddNewModalButton = NeedAddNewModalButton;
