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
exports.makeInvoiceSetAsSentValidationSchema = exports.makeInvoiceIssueValidationSchema = exports.makeInvoiceValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const commonFields = {
    _contract: Yup.object()
        .required('Wybierz kontrakt'),
    issueDate: Yup.date()
        .required('Data wystawienia jest wymagana'),
    _entity: Yup.object()
        .required('Wybierz podmiot'),
    daysToPay: Yup.number()
        .required('To pole jest wymagane')
        .min(1, 'Liczba musi być większa lub równa 0')
        .max(60, 'Liczba musi być mniejsza lub równa 60'),
    status: Yup.string()
        .required('Status jest wymagany'),
    _owner: Yup.object()
        .required('Podaj kto rejestruje'),
    description: Yup.string()
        .max(300, 'Opis może mieć maksymalnie 300 znaków'),
};
function makeInvoiceValidationSchema(isEditing) {
    return (Yup.object().shape({
        ...commonFields,
    }));
}
exports.makeInvoiceValidationSchema = makeInvoiceValidationSchema;
function makeInvoiceIssueValidationSchema() {
    return (Yup.object().shape({
        number: Yup.string()
            .min(6, 'Numer musi mieć co najmniej 6 znaków')
            .max(9, 'Numer może mieć maksymalnie 9 znaków'),
        file: Yup.mixed()
            .test('file', 'Plik jest wymagany', (value) => {
            console.log('issueInvoiceSchema:', value);
            return value && value.length > 0;
        })
    }));
}
exports.makeInvoiceIssueValidationSchema = makeInvoiceIssueValidationSchema;
function makeInvoiceSetAsSentValidationSchema() {
    return (Yup.object().shape({
        sentDate: Yup.date()
            .required('Data nadania jest wymagana'),
    }));
}
exports.makeInvoiceSetAsSentValidationSchema = makeInvoiceSetAsSentValidationSchema;
