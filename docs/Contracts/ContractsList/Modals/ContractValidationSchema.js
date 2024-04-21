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
exports.contractDatesValidationSchema = exports.contractStatusValidationSchema = exports.contractNameValidationSchema = exports.otherContractValidationSchema = exports.ourContractValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const name = Yup.string()
    .required("Nazwa jest wymagana")
    .min(3, "Nazwa musi mieć przynajmniej 3 znaki")
    .max(500, "Nazwa może mieć maksymalnie 150 znaków");
const status = Yup.string().required("Status jest wymagany");
const value = GenericComponents_1.valueValidation;
const dateFields = {
    startDate: Yup.date()
        .required("Data rozpoczęcia jest wymagana")
        .test("startDateValidation", "Początek musi być wcześniejszy niż zakończenie", function (value) {
        return this.parent.endDate >= value;
    }),
    endDate: Yup.date()
        .required("Data zakończenia jest wymagana")
        .test("endDateValidation", "Koniec musi być późniejszy niż początek", function (value) {
        return value >= this.parent.startDate;
    }),
    guaranteeEndDate: Yup.date().test("guaranteeEndDateValidation", "Gwarancja ma kończyć się zakończeniu umowy", function (value) {
        if (!value || !this.parent.endDate) {
            return true; // albo 'true' jeśli chcesz zezwolić na brakujące daty
        }
        return value > this.parent.endDate;
    }),
};
const commonFields = {
    name,
    status,
    value,
    ...dateFields,
    _type: Yup.object().required("Typ kontraktu jest wymagany"),
    number: Yup.string().required("Numer jest wymagany").max(50, "Numer może mieć maksymalnie 50 znaków"),
    alias: Yup.string().max(30, "Alias może mieć maksymalnie 30 znaków"),
    comment: Yup.string().max(1000, "Komentarz może mieć maksymalnie 1000 znaków"),
};
function ourContractValidationSchema(isEditing) {
    return Yup.object().shape({
        ...commonFields,
        _city: Yup.object().required("Wybierz miasto"),
        _admin: Yup.object().required("Wybierz administratora"),
        _manager: Yup.object().required("Wybierz koordynatora"),
        _employers: Yup.array().required("Wybierz Zamawiającego"),
    });
}
exports.ourContractValidationSchema = ourContractValidationSchema;
function otherContractValidationSchema(isEditing) {
    return Yup.object().shape({
        ...commonFields,
        _contractors: Yup.array(),
        _ourContract: Yup.object().required("Powiązana umowa Envi jest wymagana"),
    });
}
exports.otherContractValidationSchema = otherContractValidationSchema;
function contractNameValidationSchema(isEditing) {
    return Yup.object().shape({
        name,
    });
}
exports.contractNameValidationSchema = contractNameValidationSchema;
function contractStatusValidationSchema(isEditing) {
    return Yup.object().shape({
        status,
    });
}
exports.contractStatusValidationSchema = contractStatusValidationSchema;
function contractDatesValidationSchema(isEditing) {
    return Yup.object().shape({
        ...dateFields,
    });
}
exports.contractDatesValidationSchema = contractDatesValidationSchema;
