"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LetterEditModalButton = LetterEditModalButton;
exports.OurLetterEditModalButton = OurLetterEditModalButton;
exports.OurLetterAddNewModalButton = OurLetterAddNewModalButton;
exports.IncomingLetterEditModalButton = IncomingLetterEditModalButton;
exports.IncomingLetterAddNewModalButton = IncomingLetterAddNewModalButton;
const react_1 = __importStar(require("react"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const LetterValidationSchema_1 = require("./LetterValidationSchema");
const IncomingLetterModalBody_1 = require("./IncomingLetterModalBody");
const OurLetterModalBody_1 = require("./OurLetterModalBody");
const LettersController_1 = require("../LettersController");
/** przycisk i modal edycji Letter */
function LetterEditModalButton({ modalProps: { onEdit, initialData }, buttonProps, }) {
    (0, react_1.useEffect)(() => {
        console.log("LetterEditModalButton initialData", initialData);
    }, [initialData]);
    return initialData.isOur ? (react_1.default.createElement(OurLetterEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps })) : (react_1.default.createElement(IncomingLetterEditModalButton, { modalProps: { onEdit, initialData }, buttonProps: buttonProps }));
}
function OurLetterEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: OurLetterModalBody_1.OurLetterModalBody,
            modalTitle: "Edycja pisma wychodzącego",
            repository: LettersController_1.lettersRepository,
            initialData: initialData,
            makeValidationSchema: LetterValidationSchema_1.ourLetterValidationSchema,
        }, buttonProps: {
            buttonVariant: "outline-success",
        } }));
}
function OurLetterAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: OurLetterModalBody_1.OurLetterModalBody,
            modalTitle: "Rejestruj pismo wychodzące",
            repository: LettersController_1.lettersRepository,
            makeValidationSchema: LetterValidationSchema_1.ourLetterValidationSchema,
        }, buttonProps: {
            buttonCaption: "Rejestruj wychodzące",
            buttonVariant: "outline-success",
        } }));
}
function IncomingLetterEditModalButton({ modalProps: { onEdit, initialData }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralEditModalButton, { modalProps: {
            onEdit: onEdit,
            ModalBodyComponent: IncomingLetterModalBody_1.IncomingLetterModalBody,
            modalTitle: "Edycja pisma przychodzącego",
            repository: LettersController_1.lettersRepository,
            initialData: initialData,
            makeValidationSchema: LetterValidationSchema_1.makeOtherLetterValidationSchema,
        }, buttonProps: {} }));
}
function IncomingLetterAddNewModalButton({ modalProps: { onAddNew }, }) {
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralAddNewModalButton, { modalProps: {
            onAddNew: onAddNew,
            ModalBodyComponent: IncomingLetterModalBody_1.IncomingLetterModalBody,
            modalTitle: "Nowe pismo przychodzące",
            repository: LettersController_1.lettersRepository,
            makeValidationSchema: LetterValidationSchema_1.makeOtherLetterValidationSchema,
        }, buttonProps: {
            buttonCaption: "Rejestruj przychodzące",
        } }));
}
