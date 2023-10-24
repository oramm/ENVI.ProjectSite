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
exports.suecurityDatesValidationSchema = exports.securityReturnedValueValidationSchema = exports.securityValueValidationSchema = exports.securityDescriptionValidationSchema = exports.securityStatusValidationSchema = exports.securityGuaranteeValidationSchema = exports.securityCashValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const CommonFormComponents_1 = require("../../../../View/Modals/CommonFormComponents");
const status = Yup.string().required('Status jest wymagany');
const description = Yup.string().max(300, 'Komentarz może mieć maksymalnie 300 znaków');
const value = CommonFormComponents_1.valueValidation;
const returnedValue = CommonFormComponents_1.valueValidation;
function getCommonFields(isEditing) {
    return {
        _contract: !isEditing ? Yup.object().required('Umowa jest wymagana') : Yup.object(),
        description,
        value,
        returnedValue,
        status
    };
}
const dateFields = {
    firstPartExpiryDate: Yup.date().required('Data jest wymagana'),
    secondPartExpiryDate: Yup.date().required('Data jest wymagana')
};
function securityCashValidationSchema(isEditing) {
    return Yup.object().shape(getCommonFields(isEditing));
}
exports.securityCashValidationSchema = securityCashValidationSchema;
function securityGuaranteeValidationSchema(isEditing) {
    return Yup.object().shape({
        ...getCommonFields(isEditing),
        ...dateFields
    });
}
exports.securityGuaranteeValidationSchema = securityGuaranteeValidationSchema;
function securityStatusValidationSchema(isEditing) {
    return Yup.object().shape({
        status
    });
}
exports.securityStatusValidationSchema = securityStatusValidationSchema;
function securityDescriptionValidationSchema(isEditing) {
    return Yup.object().shape({
        description
    });
}
exports.securityDescriptionValidationSchema = securityDescriptionValidationSchema;
function securityValueValidationSchema(isEditing) {
    return Yup.object().shape({
        value
    });
}
exports.securityValueValidationSchema = securityValueValidationSchema;
function securityReturnedValueValidationSchema(isEditing) {
    return Yup.object().shape({
        returnedValue
    });
}
exports.securityReturnedValueValidationSchema = securityReturnedValueValidationSchema;
function suecurityDatesValidationSchema(isEditing) {
    return Yup.object().shape({
        ...dateFields
    });
}
exports.suecurityDatesValidationSchema = suecurityDatesValidationSchema;
