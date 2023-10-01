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
exports.SecurityGuaranteeValidationSchema = exports.securityCashValidationSchema = void 0;
const Yup = __importStar(require("yup"));
const CommonFormComponents_1 = require("../../../../View/Modals/CommonFormComponents");
function getCommonFields(isEditing) {
    return {
        _contract: !isEditing ? Yup.object().required('Umowa jest wymagana') : Yup.object(),
        description: Yup.string()
            .max(300, 'Komentarz może mieć maksymalnie 300 znaków'),
        value: CommonFormComponents_1.valueValidation,
        returnedValue: CommonFormComponents_1.valueValidation,
    };
}
function securityCashValidationSchema(isEditing) {
    return Yup.object().shape(getCommonFields(isEditing));
}
exports.securityCashValidationSchema = securityCashValidationSchema;
function SecurityGuaranteeValidationSchema(isEditing) {
    return Yup.object().shape({
        ...getCommonFields(isEditing),
        firstPartExpiryDate: Yup.date().required('Data jest wymagana'),
        secondPartExpiryDate: Yup.date().required('Data jest wymagana')
    });
}
exports.SecurityGuaranteeValidationSchema = SecurityGuaranteeValidationSchema;
