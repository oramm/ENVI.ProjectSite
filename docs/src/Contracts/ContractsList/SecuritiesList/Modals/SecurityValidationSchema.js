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
exports.securityCashValidationSchema = securityCashValidationSchema;
exports.securityGuaranteeValidationSchema = securityGuaranteeValidationSchema;
exports.securityStatusValidationSchema = securityStatusValidationSchema;
exports.securityDescriptionValidationSchema = securityDescriptionValidationSchema;
exports.securityValueValidationSchema = securityValueValidationSchema;
exports.securityReturnedValueValidationSchema = securityReturnedValueValidationSchema;
exports.suecurityDatesValidationSchema = suecurityDatesValidationSchema;
const Yup = __importStar(require("yup"));
const GenericComponents_1 = require("../../../../View/Modals/CommonFormComponents/GenericComponents");
const status = Yup.string().required("Status jest wymagany");
const description = Yup.string().max(300, "Komentarz może mieć maksymalnie 300 znaków");
const value = GenericComponents_1.valueValidation;
const returnedValue = GenericComponents_1.valueValidation;
function getCommonFields(isEditing) {
    return {
        _contract: !isEditing ? Yup.object().required("Umowa jest wymagana") : Yup.object(),
        description,
        value,
        returnedValue,
        status,
    };
}
const dateFields = {
    firstPartExpiryDate: Yup.date().required("Data jest wymagana"),
    secondPartExpiryDate: Yup.date().required("Data jest wymagana"),
};
function securityCashValidationSchema(isEditing) {
    return Yup.object().shape(getCommonFields(isEditing));
}
function securityGuaranteeValidationSchema(isEditing) {
    return Yup.object().shape({
        ...getCommonFields(isEditing),
        ...dateFields,
    });
}
function securityStatusValidationSchema(isEditing) {
    return Yup.object().shape({
        status,
    });
}
function securityDescriptionValidationSchema(isEditing) {
    return Yup.object().shape({
        description,
    });
}
function securityValueValidationSchema(isEditing) {
    return Yup.object().shape({
        value,
    });
}
function securityReturnedValueValidationSchema(isEditing) {
    return Yup.object().shape({
        returnedValue,
    });
}
function suecurityDatesValidationSchema(isEditing) {
    return Yup.object().shape({
        ...dateFields,
    });
}
