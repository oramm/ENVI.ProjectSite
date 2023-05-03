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
exports.otherContractValidationSchema = exports.ourContractValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const commonFields = {
    _type: Yup.object().required('Typ kontraktu jest wymagany'),
    number: Yup.string()
        .required('Numer jest wymagany')
        .max(50, 'Numer może mieć maksymalnie 50 znaków'),
    name: Yup.string()
        .required('Nazwa jest wymagana')
        .min(3, 'Nazwa musi mieć przynajmniej 3 znaki')
        .max(150, 'Nazwa może mieć maksymalnie 150 znaków'),
    alias: Yup.string()
        .max(30, 'Alias może mieć maksymalnie 30 znaków'),
    comment: Yup.string()
        .max(1000, 'Komentarz może mieć maksymalnie 1000 znaków'),
    value: CommonComponents_1.valueValidation,
    status: Yup.string().required('Status jest wymagany'),
    startDate: Yup.date().required('Data rozpoczęcia jest wymagana')
        .test('startDateValidation', 'Początek musi być wcześniejszy niż zakończenie', function (value) {
        return this.parent.endDate > value;
    }),
    endDate: Yup.date().required('Data zakończenia jest wymagana')
        .test('endDateValidation', 'Koniec musi być późniejszy niż początek', function (value) {
        return value > this.parent.startDate;
    }),
};
exports.ourContractValidationSchema = Yup.object().shape({
    ...commonFields,
    ourId: Yup.string()
        .required('Oznaczenie jest wymagane')
        .min(9, 'Oznaczenie musi mieć przynajmniej 9 znaków z kropkami')
        .max(11, 'Oznacznie może mieć maksymalnie 11 znaków')
        .test('threeCharsBeforeFirstDot', 'Oznaczenie musi mieć 3 znaki przed pierwszą kropką', function (value) {
        const parts = value.split('.');
        return parts[0].length === 3;
    })
        .test('textAfterFirstDotEqualsType', 'Po pierwszej kropce musi następować tekst równy wybranemu typowi kontraktu', function (value) {
        const parts = value.split('.');
        const { _type } = this.parent;
        return _type ? parts[1] === _type.name : false;
    })
        .test('containsTwoDots', 'Oznaczenie musi zawierać dwie kropki', (value) => {
        const parts = value.split('.');
        return parts.length === 3;
    }),
});
exports.otherContractValidationSchema = Yup.object().shape({
    ...commonFields,
    _contractors: Yup.array(),
    _ourContract: Yup.object()
        .required('Powiązana umowa Envi jest wymagana'),
});
