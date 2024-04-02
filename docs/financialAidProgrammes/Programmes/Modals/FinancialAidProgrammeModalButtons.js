"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialAidProgrammeAddNewModalButton = exports.FinancialAidProgrammeEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const FinancialAidProgrammeModalBody_1 = require("./FinancialAidProgrammeModalBody");
const FinancialAidProgrammesController_1 = require("../../FinancialAidProgrammesController");
const FinancialAidProgrammeValidationSchema_1 = require("../FinancialAidProgrammeValidationSchema");
function FinancialAidProgrammeEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: FinancialAidProgrammeModalBody_1.FinancialAidProgrammeModalBody,
            modalTitle: "Edycja programu dotacji",
            repository: FinancialAidProgrammesController_1.financialAidProgrammesRepository,
            initialData: initialData,
            makeValidationSchema: FinancialAidProgrammeValidationSchema_1.makeFinancialAidProgrammeValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.FinancialAidProgrammeEditModalButton = FinancialAidProgrammeEditModalButton;
function FinancialAidProgrammeAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: FinancialAidProgrammeModalBody_1.FinancialAidProgrammeModalBody,
            modalTitle: "Dodaj program dotacji",
            repository: FinancialAidProgrammesController_1.financialAidProgrammesRepository,
            makeValidationSchema: FinancialAidProgrammeValidationSchema_1.makeFinancialAidProgrammeValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj program",
            buttonVariant: "outline-success",
        } }));
}
exports.FinancialAidProgrammeAddNewModalButton = FinancialAidProgrammeAddNewModalButton;
