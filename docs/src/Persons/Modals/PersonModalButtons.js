"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonAddNewModalButton = exports.PersonEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../View/Modals/GeneralModalButtons");
const PersonsController_1 = require("../PersonsController");
const PersonModalBody_1 = require("./PersonModalBody");
const PersonValidationSchema_1 = require("./PersonValidationSchema");
const personsV2Helpers_1 = require("../personsV2Helpers");
function PersonEditModalButton({ modalProps: { onEdit, initialData }, }) {
    async function handleEdit(editedObject) {
        // Po zapisie legacy, wyslij PUT v2 account + profile
        // Pola account (systemRoleId, systemEmail) sa zakomentowane w formularzu Persons
        // Wysylamy puste payloady -- endpointy v2 tworza/aktualizuja rekordy
        if (editedObject?.id) {
            await (0, personsV2Helpers_1.savePersonV2AccountAndProfile)(editedObject.id, {}, {}, "Persons");
        }
        onEdit(editedObject);
    }
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: handleEdit,
            ModalBodyComponent: PersonModalBody_1.PersonModalBody,
            modalTitle: "Edycja danych osoby",
            repository: PersonsController_1.personsRepository,
            initialData: initialData,
            makeValidationSchema: PersonValidationSchema_1.makePersonValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.PersonEditModalButton = PersonEditModalButton;
function PersonAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: PersonModalBody_1.PersonModalBody,
            modalTitle: "Dodaj osobę",
            repository: PersonsController_1.personsRepository,
            makeValidationSchema: PersonValidationSchema_1.makePersonValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj osobę",
            buttonVariant: "outline-success",
        } }));
}
exports.PersonAddNewModalButton = PersonAddNewModalButton;
