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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeOtherLetterValidationSchema = exports.InvoiceItemValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const commonFields = {
    _contract: Yup.object()
        .required('Wybierz kontrakt'),
    issueDate: Yup.date()
        .required('Data wystawienia jest wymagana'),
    _entity: Yup.array()
        .required('Wybierz podmiot'),
    daysToPay: Yup.number()
        .required('To pole jest wymagane')
        .min(0, 'Liczba musi być większa lub równa 0')
        .max(60, 'Liczba musi być mniejsza lub równa 60'),
    status: Yup.string()
        .required('Status jest wymagany'),
    _editor: Yup.object()
        .required('Podaj kto rejestruje'),
    description: Yup.string()
        .max(300, 'Opis może mieć maksymalnie 1000 znaków'),
};
function InvoiceItemValidationSchema(isEditing) {
    return (Yup.object().shape({
        ...commonFields,
        _template: isEditing ? Yup.object() : Yup.object().required('Wybierz szablon'),
    }));
}
exports.InvoiceItemValidationSchema = InvoiceItemValidationSchema;
function makeOtherLetterValidationSchema(isEditing) {
    return (Yup.object().shape({
        ...commonFields,
        number: Yup.string()
            .required('Numer jest wymagany')
            .max(50, 'Numer może mieć maksymalnie 50 znaków'),
    }));
}
exports.makeOtherLetterValidationSchema = makeOtherLetterValidationSchema;
