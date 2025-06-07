"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityAddNewModalButton = exports.EntityEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../View/Modals/GeneralModalButtons");
const EntitiesController_1 = require("../EntitiesController");
const EntityModalBody_1 = require("./EntityModalBody");
const EntityValidationSchema_1 = require("./EntityValidationSchema");
function EntityEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: EntityModalBody_1.EntityModalBody,
            modalTitle: "Edycja danych podmiotu",
            repository: EntitiesController_1.entitiesRepository,
            initialData: initialData,
            makeValidationSchema: EntityValidationSchema_1.makeEntityValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.EntityEditModalButton = EntityEditModalButton;
function EntityAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: EntityModalBody_1.EntityModalBody,
            modalTitle: "Dodaj podmiot",
            repository: EntitiesController_1.entitiesRepository,
            makeValidationSchema: EntityValidationSchema_1.makeEntityValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj podmiot",
            buttonVariant: "outline-success",
        } }));
}
exports.EntityAddNewModalButton = EntityAddNewModalButton;
