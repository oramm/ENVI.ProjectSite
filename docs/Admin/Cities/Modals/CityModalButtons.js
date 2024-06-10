"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityAddNewModalButton = exports.CityEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const CitiesController_1 = require("../CitiesController");
const CityModalBody_1 = require("./CityModalBody");
const CityValidationSchema_1 = require("./CityValidationSchema");
function CityEditModalButton({ modalProps: { onEdit, initialData } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: CityModalBody_1.CityModalBody,
            modalTitle: "Edycja danych miasta",
            repository: CitiesController_1.citiesRepository,
            initialData: initialData,
            makeValidationSchema: CityValidationSchema_1.makeCityValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.CityEditModalButton = CityEditModalButton;
function CityAddNewModalButton({ modalProps: { onAddNew } }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: CityModalBody_1.CityModalBody,
            modalTitle: "Dodaj miasto",
            repository: CitiesController_1.citiesRepository,
            makeValidationSchema: CityValidationSchema_1.makeCityValidationSchema,
        }, buttonProps: {
            buttonCaption: "Dodaj miasto",
            buttonVariant: "outline-success",
        } }));
}
exports.CityAddNewModalButton = CityAddNewModalButton;
