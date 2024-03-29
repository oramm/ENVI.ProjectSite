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
exports.makeOtherLetterValidationSchema = exports.ourLetterValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const commonFields = {
    _contract: Yup.object()
        .required('Wybierz kontrakt'),
    _cases: Yup.array()
        .required('Wybierz sprawy'),
    description: Yup.string()
        .required('Opis jest wymagany')
        .max(300, 'Opis może mieć maksymalnie 300 znaków'),
    creationDate: Yup.date()
        .required('Data utworzenia jest wymagana')
        .max(new Date(), 'Data utworzenia nie może być z przyszłości')
        .test('creationDateValidation', 'Pismo nie może być nadane przed utworzeniem', function (value) {
        return this.parent.registrationDate >= value;
    }),
    registrationDate: Yup.date()
        //.required('Data nadania jest wymagana')
        .max(new Date(), 'Data nadania nie może być z przyszłości')
        .test('registrationDateValidation', 'Pismo nie może być nadane przed utworzeniem', function (value) {
        if (value === undefined)
            return true;
        return value >= this.parent.creationDate;
    }),
    _entitiesMain: Yup.array()
        .required('Wybierz podmiot'),
    _editor: Yup.object()
        .required('Podaj kto rejestruje'),
};
function ourLetterValidationSchema(isEditing) {
    return (Yup.object().shape({
        ...commonFields,
        _template: isEditing ? Yup.object() : Yup.object().required('Wybierz szablon'),
    }));
}
exports.ourLetterValidationSchema = ourLetterValidationSchema;
function makeOtherLetterValidationSchema(isEditing) {
    return (Yup.object().shape({
        ...commonFields,
        number: Yup.string()
            .required('Numer jest wymagany')
            .max(50, 'Numer może mieć maksymalnie 50 znaków'),
    }));
}
exports.makeOtherLetterValidationSchema = makeOtherLetterValidationSchema;
