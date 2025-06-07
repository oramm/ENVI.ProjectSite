"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendAnotherOfferModalButton = exports.SendOfferModalButton = void 0;
const react_1 = __importDefault(require("react"));
const FilterableTableContext_1 = require("../../../../View/Resultsets/FilterableTable/FilterableTableContext");
const GeneralModalButtons_1 = require("../../../../View/Modals/GeneralModalButtons");
const SendOfferModalBody_1 = require("./SendOfferModalBody");
const OffersController_1 = require("../../OffersController");
const SendOfferValidationSchema_1 = require("./SendOfferValidationSchema");
function SendOfferModalButton({ modalProps: { initialData } }) {
    const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: handleEditObject,
            ModalBodyComponent: SendOfferModalBody_1.SendOfferModalBody,
            modalTitle: "Wyślij ofertę mailem",
            repository: OffersController_1.offersRepository,
            initialData,
            makeValidationSchema: SendOfferValidationSchema_1.makeSendOfferValidationSchema,
            specialActionRoute: "sendOffer",
        }, buttonProps: {
            buttonCaption: "Wyślij mailem",
            buttonVariant: "outline-success",
        } }));
}
exports.SendOfferModalButton = SendOfferModalButton;
function SendAnotherOfferModalButton({ modalProps: { initialData } }) {
    const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: handleEditObject,
            ModalBodyComponent: SendOfferModalBody_1.SendOfferModalBody,
            modalTitle: "Wyślij kolejną wersję oferty mailem",
            repository: OffersController_1.offersRepository,
            initialData,
            makeValidationSchema: SendOfferValidationSchema_1.makeSendAnotherOfferValidationSchema,
            specialActionRoute: "sendOffer",
        }, buttonProps: {
            buttonCaption: "Wyślij kolejną wersję mailem",
            buttonVariant: "outline-success",
        } }));
}
exports.SendAnotherOfferModalButton = SendAnotherOfferModalButton;
