"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferBondDeleteModalButton = exports.OfferBondAddNewModalButton = exports.OfferBondEditModalButton = void 0;
const react_1 = __importDefault(require("react"));
const GeneralModalButtons_1 = require("../../../../View/Modals/GeneralModalButtons");
const OffersController_1 = require("../../OffersController");
const OfferBondModalBody_1 = require("./OfferBondModalBody");
const OfferBondValidationSchema_1 = __importDefault(require("./OfferBondValidationSchema"));
const FilterableTableContext_1 = require("../../../../View/Resultsets/FilterableTable/FilterableTableContext");
function OfferBondEditModalButton({ modalProps: { initialData } }) {
    const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: handleEditObject,
            ModalBodyComponent: OfferBondModalBody_1.OfferBondModalBody,
            modalTitle: "Edycja wadium",
            repository: OffersController_1.OffersRepository,
            initialData: initialData,
            makeValidationSchema: OfferBondValidationSchema_1.default,
            specialActionRoute: "editOfferBond",
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
exports.OfferBondEditModalButton = OfferBondEditModalButton;
function OfferBondAddNewModalButton({ modalProps: { initialData }, }) {
    const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: handleEditObject,
            ModalBodyComponent: OfferBondModalBody_1.OfferBondModalBody,
            modalTitle: "Dodaj wadium",
            repository: OffersController_1.OffersRepository,
            initialData: initialData,
            makeValidationSchema: OfferBondValidationSchema_1.default,
            specialActionRoute: "addNewOfferBond",
        }, buttonProps: {
            buttonVariant: "outline-success",
            buttonCaption: "Dodaj wadium",
        } }));
}
exports.OfferBondAddNewModalButton = OfferBondAddNewModalButton;
function OfferBondDeleteModalButton({ modalProps: { initialData }, }) {
    const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: handleEditObject,
            ModalBodyComponent: OfferBondModalBody_1.OfferBondModalBody,
            modalTitle: "Usuń wadium",
            repository: OffersController_1.OffersRepository,
            initialData: initialData,
            //makeValidationSchema: makeOfferBondValidationSchema,
            specialActionRoute: "deleteOfferBond",
        }, buttonProps: {
            buttonVariant: "outline-danger",
            buttonCaption: "Usuń wadium",
        } }));
}
exports.OfferBondDeleteModalButton = OfferBondDeleteModalButton;
