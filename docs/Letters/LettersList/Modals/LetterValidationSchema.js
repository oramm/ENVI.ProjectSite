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
exports.otherLetterValidationSchema = exports.ourLetterValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const commonFields = {
    _contract: Yup.object()
        .required('Wybież kontrakt'),
    number: Yup.string()
        .required('Numer jest wymagany')
        .max(50, 'Numer może mieć maksymalnie 50 znaków'),
    description: Yup.string()
        .max(1000, 'Opis może mieć maksymalnie 1000 znaków'),
    creationDate: Yup.date().required('Data rozpoczęcia jest wymagana')
        .test('creationDateValidation', 'Początek musi być wcześniejszy niż zakończenie', function (value) {
        return this.parent.registrationDate >= value;
    }),
    registrationDate: Yup.date().required('Data zakończenia jest wymagana')
        .test('registrationDateValidation', 'Koniec musi być późniejszy niż początek', function (value) {
        return value >= this.parent.creationDate;
    }),
    _entitiesMain: Yup.array(),
    _editor: Yup.object()
        .required('Podaj kto rejestruje'),
};
exports.ourLetterValidationSchema = Yup.object().shape({
    ...commonFields,
});
exports.otherLetterValidationSchema = Yup.object().shape({
    ...commonFields,
});
