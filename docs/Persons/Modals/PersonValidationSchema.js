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
exports.makePersonValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const commonFields = {
    name: Yup.string()
        .required('Podaj imię')
        .max(50, 'Imię może mieć maksymalnie 50 znaków'),
    surname: Yup.string()
        .required('Podaj nazwisko')
        .max(50, 'Nazwisko może mieć maksymalnie 50 znaków'),
    position: Yup.string()
        .max(200, 'Stanowisko może mieć maksymalnie 200 znaków'),
    email: Yup.string()
        .default('')
        .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Nieprawidłowy format email')
        .max(50, 'Email może mieć maksymalnie 50 znaków'),
    cellphone: Yup.string()
        .max(25, 'Numer komórki może mieć maksymalnie 25 znaków'),
    phone: Yup.string()
        .max(25, 'Numer telefonu może mieć maksymalnie 25 znaków'),
    comment: Yup.string()
        .max(200, 'Komentarz może mieć maksymalnie 200 znaków'),
};
function makePersonValidationSchema(isEditing) {
    return (Yup.object().shape({
        ...commonFields,
    }));
}
exports.makePersonValidationSchema = makePersonValidationSchema;
