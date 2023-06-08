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
exports.InvoiceItemValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const commonFields = {
    description: Yup.string()
        .required('To pole jest wymagane')
        .min(10, 'Opis musi zawiera co najmniej 10 znaków')
        .max(300, 'Opis może mieć maksymalnie 1000 znaków'),
    quantity: Yup.number()
        .required('To pole jest wymagane')
        .min(1, 'Ilość musi być większa lub równa 1'),
    unitPrice: Yup.number()
        .required('To pole jest wymagane')
        .min(1, 'Cena musi być większa lub równa 1'),
    vatTax: Yup.number()
        .required('To pole jest wymagane')
        .min(1, 'Stawka musi być większa lub równa 1')
        .max(23, 'Stawka musi być mniejsza lub równa 23'),
};
function InvoiceItemValidationSchema(isEditing) {
    return (Yup.object().shape({
        ...commonFields,
    }));
}
exports.InvoiceItemValidationSchema = InvoiceItemValidationSchema;
